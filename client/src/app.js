'use strict';

// todo: factor components out into separate files

import * as _ from 'lodash';
import io from 'socket.io-client';
import { BrowserRouter, NavLink, Route } from 'react-router-dom';
import ReactTwitchEmbedVideo from "./components/ReactTwitchEmbedVideo"

const socket = io();

const HEROS = [
  {
    twitchName: 'Ana',
    displayName: 'Ana',
    routeName: '/ana',
  },
  {
    twitchName: 'Bastion',
    displayName: 'Bastion',
    routeName: '/bastion',
  },
  {
    twitchName: 'D. VA',
    displayName: 'D. Va',
    routeName: '/dva',
  },
  {
    twitchName: 'Doomfist',
    displayName: 'Doomfist',
    routeName: '/doomfist',
  },
  {
    twitchName: 'Genji',
    displayName: 'Genji',
    routeName: '/genji',
  },
  {
    twitchName: 'Hanzo',
    displayName: 'Hanzo',
    routeName: '/hanzo',
  },
  {
    twitchName: 'Junkrat',
    displayName: 'Junkrat',
    routeName: '/junkrat',
  },
  {
    twitchName: 'Lucio',
    displayName: 'Lucio',
    routeName: '/lucio',
  },
  {
    twitchName: 'Mccree',
    displayName: 'McCree',
    routeName: '/mccree',
  },
  {
    twitchName: 'Mei',
    displayName: 'Mei',
    routeName: '/mei',
  },
  {
    twitchName: 'Mercy',
    displayName: 'Mercy',
    routeName: '/mercy',
  },
  {
    twitchName: 'Moira',
    displayName: 'Moira',
    routeName: '/moira',
  },
  {
    twitchName: 'Orisa',
    displayName: 'Orisa',
    routeName: '/orisa',
  },
  {
    twitchName: 'Pharah',
    displayName: 'Pharah',
    routeName: '/pharah',
  },
  {
    twitchName: 'Reaper',
    displayName: 'Reaper',
    routeName: '/reaper',
  },
  {
    twitchName: 'Reinhardt',
    displayName: 'Reinhardt',
    routeName: '/reinhardt',
  },
  {
    twitchName: 'Roadhog',
    displayName: 'Roadhog',
    routeName: '/roadhog',
  },
  {
    twitchName: 'Soldier: 76',
    displayName: 'Soldier: 76',
    routeName: '/soldier76',
  },
  {
    twitchName: 'Sombra',
    displayName: 'Sombra',
    routeName: '/sombra',
  },
  {
    twitchName: 'Symmetra',
    displayName: 'Symmetra',
    routeName: '/symmetra',
  },
  {
    twitchName: 'Tracer',
    displayName: 'Tracer',
    routeName: '/tracer',
  },
  {
    twitchName: 'Widowmaker',
    displayName: 'Widowmaker',
    routeName: '/widowmaker',
  },
  {
    twitchName: 'Winston',
    displayName: 'Winston',
    routeName: '/winston',
  },
  {
    twitchName: 'Zarya',
    displayName: 'Zarya',
    routeName: '/zarya',
  },
  {
    twitchName: 'Zenyatta',
    displayName: 'Zenyatta',
    routeName: '/zenyatta',
  },
];

// Make both the HeroStream and the NoMetadataError components subscribe to this event
// NoMetadataError will use it to remove the error
function subscribeToStreams(cb) {
  socket.on('streams', data => {
    console.log('data', data);
    cb(null, data);
  });
}

function subscribeToNoMetadata(cb) {
  socket.on('noMetadata', () => {
    cb();
  });
}

// Question: when do you want to refresh?
// Answer: if your stream isn't showing your hero anymore.
// Answer 2: if there's a better stream showing your hero?

let hackyThing = 0;
class HeroStream extends React.Component {
  getChannel(heroName, streams) {
    const channelMetadata = _.first(_.get(streams, heroName, []));
    return _.get(channelMetadata, 'login', 'monstercat');
  }
  constructor(props) {
    super(props);
    const channel = this.getChannel(props.heroName);
    this.state = {
      heroName: props.heroName,
      channel,
    };
    subscribeToStreams((err, streams) => {
      const streamersForThisHero = _.map(streams[this.state.heroName], 'login');
      if (!_.includes(streamersForThisHero, this.state.channel)) {
        const channel = this.getChannel(this.state.heroName, streams);
        this.setState({ channel });
      }
    });
  }
  render() {
    return <TwitchEmbed channel={this.state.channel} key={this.state.channel}/>;
  }
}

class TwitchEmbed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chat: true,
      autoFollow: true,
    };
  }
  handleChatChange(event) {
    const chat = !this.state.chat;
    this.setState({ chat });
  }
  render() {
    return (
      <div className="container">
       <h1 className="title is-1">{this.props.channel}</h1>
        <ReactTwitchEmbedVideo channel={this.props.channel} layout={this.state.chat ? '' : 'video'} width="100%" height="750" key={this.props.channel + this.state.chat}/>
        <Options 
          chat={this.state.chat}
          handleChatChange={this.handleChatChange.bind(this)}
          autoFollow={this.state.autoFollow}
        />
      </div>
    );
  }
}


class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <div>
            <Navbar/>
          </div>
          <div className="columns">
            <div className="column is-narrow menu">
              <Sidebar/>
            </div>
            <div className="column">
              <NoMetadataError/>
              <Routes/>
            </div>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

class Options extends React.Component {
  render() {
    return (
      <div className="level">
        <div className="level-left">
          <div className="level-item">
            <input id="autoFollow" type="checkbox" name="autoFollow" className="switch is-success is-medium" defaultChecked={this.props.autoFollow}/>
            <label htmlFor="autoFollow">Auto Follow</label>
          </div>
          <div className="level-item">
            <input id="chat" type="checkbox" name="chat" className="switch is-success is-medium" defaultChecked={this.props.chat} onChange={this.props.handleChatChange}/>
            <label htmlFor="chat">Chat</label>
          </div>
        </div>
      </div>
    );
  }
}

class NoMetadataError extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
    };
    subscribeToNoMetadata(() => this.setState({ display : true }));
  }
  render() {
    const errorMessage = (
      <div className="notification is-danger">Error: cannot retrieve streams. Please try again later.</div>
    );
    return this.state.display ? errorMessage : null;
  }
}

class Navbar extends React.Component {
  render() {
    return (
      <nav className="navbar" role="navigation">
        <div className="navbar-brand">
          <a className="navbar-item title is-5" href="/">
            Overwatch Hero Streamer
          </a>
        </div>
        <div className="navbar-menu">
          <div className="navbar-end is-grouped">
            <a className="navbar-item button is-large" href="https://github.com/RandomSeeded/HeroStream">
              <span className="icon is-medium fab fa-github-square fa-inverse"></span>
            </a>
          </div>
        </div>
      </nav>
    );
  }
}

class Sidebar extends React.Component {
  render() {
    const links = HEROS.map((hero, i) => 
      (
        <li key={i}>
          <NavLink to={hero.routeName} activeClassName="is-active" className="is-hovered">{hero.displayName}</NavLink>
        </li>
      )
    );
    return (
      <div>
        <nav>
          <ul className="menu-list">
            {links}
          </ul>
        </nav>
      </div>
    );
  }
}

class Routes extends React.Component {
  render() {
    const routes = HEROS.map((hero, i) =>
      <Route path={hero.routeName} key={i} render={()=><HeroStream heroName={hero.twitchName}/>}/>
    );
    return (
      routes
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
