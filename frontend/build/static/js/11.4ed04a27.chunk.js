(this["webpackJsonpsh-frontend"]=this["webpackJsonpsh-frontend"]||[]).push([[11],{99:function(t,e,n){"use strict";n.r(e);var a=n(63),s=n(64),i=n(117),c=n(116),o=n(118),r=n(0),u=n.n(r),h=n(378),l=n(379),d=n(5),p=function(t){function e(t){var n;return Object(a.a)(this,e),(n=Object(i.a)(this,Object(c.a)(e).call(this,t))).onUpdate=function(t){return n.setState({state:t})},n.handleClick=function(){return n.props.core.publishJson("switch/".concat(n.state.id,"/toggle"))},n.state={state:t.state,name:t.name,id:t.id},n}return Object(o.a)(e,t),Object(s.a)(e,[{key:"componentDidMount",value:function(){this.props.core.subscribe("switch/".concat(this.state.id),this.onUpdate)}},{key:"componentWillUnmount",value:function(){this.props.core.unsubscribe("switch/".concat(this.state.id),this.onUpdate)}},{key:"render",value:function(){var t=this.state,e=t.state,n=t.name,a=this.props.classes;return u.a.createElement(l.a,{item:!0,lg:4,md:6,sm:6,xs:12},u.a.createElement(h.a,{color:e?"primary":"default",variant:"contained",className:a.button,fullWidth:!0,size:"large",onClick:this.handleClick},n))}}]),e}(r.Component);e.default=Object(d.a)((function(t){return{button:{"&:active":{boxShadow:t.shadows[2]}}}}))(p)}}]);