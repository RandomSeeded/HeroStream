'use strict';

// todo: factor components out into separate files

import * as _ from 'lodash';
import io from 'socket.io-client';
import { BrowserRouter, NavLink, Route } from 'react-router-dom';
import ReactTwitchEmbedVideo from "./components/ReactTwitchEmbedVideo"

// const socket = io.connect(window.location.origin, { path: window.location.pathname });
const socket = io.connect();

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
    twitchName: 'Torbjorn',
    displayName: 'Torbjorn',
    routeName: '/torbjorn',
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
// StreamCache is TEMP HACK ONLY
let streamCache;
function subscribeToStreams(cb) {
  socket.on('streams', data => {
    streamCache = data;
    cb(null, data);
  });
}

function getChannel(heroName, streams) {
  console.log('heroName', heroName);
  console.log('streams', streams);
  const channelMetadata = _.first(_.get(streams, heroName, []));
  const res = _.get(channelMetadata, 'login', 'monstercat');
  console.log('switching to', res);
  return res;
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
  handleAutoSwitchChange(event) {
    const autoSwitch = !this.state.autoSwitch;
    this.setState({ autoSwitch });
  }
  constructor(props) {
    super(props);
    // StreamCache is TEMP HACK ONLY. This cache should be moved into a parent of the herostream (requires moving the subscribe), and the cache passed as props to this component
    const channel = this.state && !this.state.autoSwitch && this.state.channel || getChannel(props.heroName, streamCache);
    this.state = {
      channel,
      autoSwitch: true,
    };
    subscribeToStreams((err, streams) => {
      console.log('streams update herostream', streams);
      const streamersForThisHero = _.map(streams[this.props.heroName], 'login');
      console.log('streamersForThisHero', streamersForThisHero);
      if (!_.includes(streamersForThisHero, this.state.channel)) {
        // const channel = getChannel(this.state.heroName, streams);
        const channel = this.state && !this.state.autoSwitch && this.state.channel || getChannel(this.props.heroName, streams);
        this.setState({ channel });
      }
    });
  }
  render() {
    return <TwitchEmbed channel={this.state.channel} key={this.state.channel + this.props.chat} autoSwitch={this.state.autoSwitch} chat={this.props.chat} handleAutoSwitchChange={this.handleAutoSwitchChange.bind(this)} handleChatChange={this.props.handleChatChange}/>;
  }
}

class TwitchEmbed extends React.Component {
  render() {
    return (
      <div className="hs-viewport-inner">
        <div className="hs-viewport-topbar">
          <h1>{this.props.channel}</h1>
          <div className="hs-topbar-opts">
            <Options 
              chat={this.props.chat}
              handleChatChange={this.props.handleChatChange}
              handleAutoSwitchChange={this.props.handleAutoSwitchChange}
              autoSwitch={this.props.autoSwitch}
            />
          </div>
        </div>
        <ReactTwitchEmbedVideo channel={this.props.channel} layout={this.props.chat ? '' : 'video'} width="100%" height="750" key={this.props.channel + this.props.chat}/>
      </div>
    );
  }
}


class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div className="hs-window">
          <div className="hs-nav">
            <Navbar/>
          </div>
          <div className="hs-view">
            <div className="hs-hero-menu">
              <aside className="hs-hero-menu-inner">
                <Sidebar/>
              </aside>
            </div>
            <div className="hs-viewport">
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
        <div className="level-left">
          <div className="level-item">
            <input id="autoSwitch" type="checkbox" name="autoSwitch" className="switch is-success is-medium" defaultChecked={this.props.autoSwitch} onChange={this.props.handleAutoSwitchChange}/>
            <label htmlFor="autoSwitch">Auto-Switch</label>
          </div>
          <div className="level-item">
            <input id="chat" type="checkbox" name="chat" className="switch is-success is-medium" defaultChecked={this.props.chat} onChange={this.props.handleChatChange}/>
            <label htmlFor="chat">Chat</label>
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
      <nav className="hs-navbar" role="navigation">
        <div className="hs-navbar-logo">
          <a className="" href="/">
            <img src="dist/imgs/hs_logo.svg" />
          </a>
        </div>
        <div className="hs-navbar-menu">
          <div className="hs-navbar-item">
            <a href="https://github.com/RandomSeeded/HeroStream">
              <span className="icon is-medium fab fa-github-square fa-inverse"></span>
            </a>
          </div>
        </div>
      </nav>
    );
  }
}

class MenuItem extends React.Component {
  // This needs to be done for each individual navlink. Aka we need a wrapping component
  constructor(props) {
    super(props);
    this.state = {
      numberOfStreamersForThisHero: -1,
    };
    subscribeToStreams((err, streams) => {
      console.log('subscribeToStreams menuItem');
      const numberOfStreamersForThisHero = _.size(streams[this.props.hero.twitchName]);
      this.setState({ numberOfStreamersForThisHero });
    });
  }
  render() {
    return (
      <li key={this.props.hero}>
        <NavLink to={this.props.hero.routeName} activeClassName="hs-is-active" className={this.state.numberOfStreamersForThisHero === 0 ? 'has-text-danger' : ''}>{this.props.hero.displayName}</NavLink>
      </li>
    );
  }
}

class Sidebar extends React.Component {
  render() {
    const links = HEROS.map((hero, i) => 
      <MenuItem hero={hero} key={i}/>
    );
    return (
        <nav className="hs-hero-nav">
          <ul className="hs-hero-nav-list">
            {links}
          </ul>
        </nav>
    );
  }
}

class Routes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chat: true,
    };
  }
  handleChatChange(event) {
    const chat = !this.state.chat;
    this.setState({ chat });
  }
  render() {
    const routes = HEROS.map((hero, i) =>
      <Route path={hero.routeName} key={i} render={()=><HeroStream heroName={hero.twitchName} chat={this.state.chat} handleChatChange={this.handleChatChange.bind(this)}/>}/>
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
