'use strict';

// todo: factor components out into separate files

import * as _ from 'lodash';
import { BrowserRouter, Link, Route } from 'react-router-dom';
import ReactTwitchEmbedVideo from "./components/ReactTwitchEmbedVideo"

const socket = io('http://localhost:5975');

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
    routeName: '/soldier: 76',
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

let streams;
let twitchEmbed;

socket.on('streams', data => {
  console.log('data', data);
  streams = data;
});

// Question: when do you want to refresh?
// Answer: if your stream isn't showing your hero anymore.
// Answer 2: if there's a better stream showing your hero?

class TwitchEmbed extends React.Component {
  render() {
    // Necessary for the side effects
    return (
      <div>
        <p>{this.props.channel}</p>
        <ReactTwitchEmbedVideo channel={this.props.channel}/>
      </div>
    );
  }
}

let hackyThing = 0;
class HeroStream extends React.Component {
  getChannel(heroName) {
    const channelMetadata = _.first(streams[heroName]);
    return _.get(channelMetadata, 'login', 'monstercat');
  }
  updateStream() {
    const streamersForThisHero = _.map(streams[this.state.heroName], 'login');
    if (!_.includes(streamersForThisHero, this.state.channel)) {
      const channel = this.getChannel(this.state.heroName);
      this.setState({ channel });
    }
  }
  componentDidMount() {
    this.interval = setInterval(() => this.updateStream(), 3000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  constructor(props) {
    super(props);
    const channel = this.getChannel(props.heroName);
    this.state = {
      heroName: props.heroName,
      channel,
    };
  }
  render() {
    return <TwitchEmbed channel={this.state.channel} key={this.state.channel}/>;
  }
}

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <Nav/>
          <Routes/>
        </div>
      </BrowserRouter>
    );
  }
}

class Nav extends React.Component {
  render() {
    const links = HEROS.map((hero, i) => 
      (
        <nav key={i}>
          <Link to={hero.routeName}>{hero.displayName}</Link>
        </nav>
      )
    );
    return (
      <div>
        {links}
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
      <div>
        {routes}
      </div>
    );
  }
}

ReactDOM.render(
  <App/>,
  document.getElementById('root')
);
