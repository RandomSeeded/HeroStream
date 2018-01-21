'use strict';

// todo: factor components out into separate files

class TwitchEmbed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: props.channel
    };
  }
  render() {
    const test = new Twitch.Embed("twitch-embed", {
      width: 854,
      height: 480,
      channel: this.state.channel,
    });
    return null;
  }
}

ReactDOM.render(
  <div>
    <h1>Hello, world!</h1>
    <h1>Hello, world!</h1>
    <TwitchEmbed channel="monstercat"/>
  </div>,
  document.getElementById('root')
);

// new Twitch.Embed("twitch-embed", {
//   width: 854,
//   height: 480,
//   channel: "monstercat"
// });
