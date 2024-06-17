import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  Route,
  Routes,
  HashRouter as Router,
  Link 
} from 'react-router-dom';

import {
  HelloOne,
  HelloTwo
} from './components';

class App extends React.Component {
    render(): JSX.Element {
      return (
        <Router>
          <div>
            <nav>
              <Link to="/">Home</Link>
              <Link to="/Two">Two</Link>
            </nav>
            <Routes>
              <Route path="/" element={<HelloOne/>} />
              <Route path="/Two" element={<HelloTwo someProp='blah'/>} />
            </Routes>
          </div>
        </Router>
      );
    }
  }

ReactDOM.render(
    <App />,
    document.getElementById("app")
);
