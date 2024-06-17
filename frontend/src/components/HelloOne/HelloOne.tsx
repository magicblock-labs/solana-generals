import * as React from 'react';
import * as styles from './styles.module.scss';

export class HelloOne extends React.Component {
  render(): JSX.Element {
    console.log(styles);
    return <h1 className={styles.default.root}>Hello from React!!</h1>;
  }
}
