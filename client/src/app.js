'use strict';

// todo: factor components out into separate files

import { BrowserRouter, Link, Route } from 'react-router-dom';

const socket = io('http://localhost:5975');
socket.on('streams', data => {
  console.log('data', data);
});

class HeroStream extends React.Component {
  render() {
    return <TwitchEmbed channel="monstercat"/>
  }
}

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
  <BrowserRouter>
    <div>
      <nav>
        <Link to="/dva">D. Va</Link>
      </nav>
      <div>
        <Route path="/dva" component={HeroStream}/>
      </div>
    </div>
  </BrowserRouter>,
  document.getElementById('root')
);

