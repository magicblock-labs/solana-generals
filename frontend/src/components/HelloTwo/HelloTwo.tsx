import * as React from 'react';
import * as styles from './styles.module.scss';

// Here, we'll just define some dummy interfaces for props and state,
// just as an example
interface Props {
  someProp: string | null;
}
interface State {
  someState: string | null;
}

export class HelloTwo extends React.Component<Props, State> {
  render(): JSX.Element {
    return <h1 className={styles.default.root}>Hello again from React!!</h1>;
  }
}
