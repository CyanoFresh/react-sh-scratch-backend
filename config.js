module.exports = {
  modules: [
    {
      id: 'switch',
      local: true,
    },
    {
      id: 'variable',
      local: true,
    },
    {
      id: 'intercom',
      local: true,
    },
    {
      id: 'rgb',
      local: true,
    },
  ],
  dashboard: [
    {
      id: 'room1',
      name: 'Room One',
      items: [
        [
          { id: 'room1-air_temperature', module: 'variable', name: 'Air Temperature', suffix: ' °C' },
          { id: 'room1-air_humidity', module: 'variable', name: 'Air Humidity', suffix: '%' },
        ],
        [
          { id: 'room1-light_switch', module: 'switch', name: 'Main Light' },
          { id: 'room1-secondary_switch', module: 'switch', name: 'Secondary Light' },
          { id: 'room1-room_rgb', module: 'rgb', name: 'Mood Light' },
        ],
      ],
    },
    {
      id: 'corridor',
      name: 'Corridor',
      items: [
        [
          { id: 'corridor-light_switch', module: 'switch', name: 'Light' },
          { id: 'corridor-intercom', module: 'intercom', name: 'Intercom' },
        ],
      ],
    },
    {
      id: 'balcony',
      name: 'Balcony',
      items: [
        [
          { id: 'balcony-air_temperature', module: 'variable', name: 'Air Temperature', suffix: ' °C' },
          { id: 'balcony-air_humidity', module: 'variable', name: 'Air Humidity', suffix: '%' },
          { id: 'balcony-air_pressure', module: 'variable', name: 'Air Pressure', suffix: ' hPa' },
        ],
      ],
    },
  ],
  users: [
    {
      id: 'CyanoFresh',
      password: 'qwerty',
      name: 'Alex',
    },
  ],
  devices: [
    {
      id: 'my-room_table',
      password: 'hi',
    },
  ],
};
