const Sequelize = require('sequelize');
const moment = require('moment');

const Op = Sequelize.Op;

const HISTORY_CLEAR_INTERVAL = 3 * 3600000;  // remove old history every 3 hours
const MAX_HISTORY_DAYS = 7;
const DEFAULT_AUTO_UNLOCK_TIMEOUT = 10 * 60000;  // 10 minutes

const HISTORY_TYPES = {
  RINGING: 0,
  UNLOCKED: 1,
  AUTO_UNLOCKED: 2,
};

class Buzzer {
  constructor(config, items, core) {
    this.id = 'buzzer';
    this.name = 'Buzzer';
    this.core = core;
    this.config = {
      defaultState: {
        isRinging: false,
        isAutoUnlock: false,
      },
      items,
      ...config,
    };
    this.states = {};
    this.timers = {};

    this.initDb();
    this.initWeb();
    this.initData();
  }

  initDb() {
    this.History = this.core.sequelize.define('BuzzerHistory', {
      item_id: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.INTEGER.UNSIGNED,
      },
    }, {
      timestamps: false,
      indexes: [
        {
          fields: ['item_id'],
        },
        {
          fields: ['date'],
        },
      ],
    });

    // Clear old history by interval
    setInterval(() => this.History.destroy({
      where: {
        date: {
          [Op.lt]: moment().subtract(MAX_HISTORY_DAYS, 'days').unix(),
        },
      },
    }), HISTORY_CLEAR_INTERVAL);
  }

  initData() {
    this.config.items.forEach((item, index) => {
      this.states[item.id] = { ...this.config.defaultState };

      this.config.items[index] = {
        ...this.config.defaultConfig,
        ...item,
      };
    });
  }

  initWeb() {
    this.core.express.apiRouter.get(`/${this.id}/:itemId/history`, (req, res, next) => {
      const item = this.config.items.find(item => item.id === req.params.itemId);

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      return this.History.findAll({
        where: {
          item_id: item.id,
        },
        order: [
          ['date', 'ASC'],
        ],
        attributes: ['date', 'type'],
      })
        .then(history => res.json({
          ok: true,
          item,
          history,
        }))
        .catch(next);
    });

    this.core.express.apiRouter.post(`/${this.id}/:itemId/auto_unlock`, (req, res, next) => {
      const item = this.config.items.find(item => item.id === req.params.itemId);

      if (!item) {
        const err = new Error('Item was not found');
        err.status = 404;
        return next(err);
      }

      this.core.aedes.publish({
        topic: `${this.id}/${item.id}/auto_unlock/set`,
        payload: JSON.stringify(true),
      }, () => {
        console.log(`[Buzzer] Enabling autoUnlock for "${item.id}"...`);

        return res.json({ ok: true });
      });
    });
  }

  getItemData(itemId) {
    const item = this.config.items.find(item => item.id === itemId);

    return {
      ...item,
      ...this.states[itemId],
    };
  }

  onMessage(params, payload) {
    const [itemId, type, action] = params;

    const data = JSON.parse(payload);

    if (type === 'ringing') {
      this.states[itemId].isRinging = data;

      if (data === true) {
        this.addHistory(itemId, HISTORY_TYPES.RINGING);
      }

      this.core.emit('buzzer.ringing', itemId, data);
    } else if (type === 'unlocked') {
      this.states[itemId].isRinging = false;
      this.states[itemId].isAutoUnlock = false;

      clearTimeout(this.timers[itemId]);

      this.addHistory(itemId, data ? HISTORY_TYPES.AUTO_UNLOCKED : HISTORY_TYPES.UNLOCKED);

      this.core.emit('buzzer.unlocked', itemId);
      this.core.emit('buzzer.ringing', itemId, false);
    } else if (type === 'auto_unlock' && action === 'set') {
      clearTimeout(this.timers[itemId]);

      // Disable auto unlock by timeout
      if (data === true) {
        console.log(`[Buzzer] AutoUnlock is enabled for "${itemId}" for ${DEFAULT_AUTO_UNLOCK_TIMEOUT} ms`);

        this.timers[itemId] = setTimeout(() => {
          this.core.aedes.publish({
            topic: `${this.id}/${itemId}/auto_unlock/set`,
            payload: JSON.stringify(false),
          }, () => console.log(`[Buzzer] Disabling autoUnlock for "${itemId}" by timeout...`));
        }, DEFAULT_AUTO_UNLOCK_TIMEOUT);
      }
    } else if (type === 'auto_unlock') {
      this.states[itemId].isAutoUnlock = data;

      this.core.emit('buzzer.auto_unlock', itemId, data);
    }
  }

  /**
   * @param {string} item_id
   * @param {HISTORY_TYPES} type
   */
  addHistory(item_id, type) {
    return this.History.create({
      item_id,
      type,
      date: moment().unix(),
    });
  }
}

module.exports = (config, items, core) => new Buzzer(config, items, core);
