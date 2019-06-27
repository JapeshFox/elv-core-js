import React from "react";

import { ElvClient } from "elv-client-js";
import ClientConfiguration from "../configuration";

import { SaveAccounts } from "./actions/Accounts";

const {Provider, Consumer} = React.createContext();

const initialState = {
  accounts: {},
  apps: ClientConfiguration.apps,
  currentAccount: localStorage.getItem("elv-current-account"),
  client: undefined,
  showHeader: true
};

export class ElvCoreProvider extends React.Component {
  constructor(props) {
    super(props);

    let storedAccounts = localStorage.getItem("elv-accounts");
    if(storedAccounts) {
      initialState.accounts = JSON.parse(atob(storedAccounts));
    }

    this.state = initialState;

    ElvClient.FromConfigurationUrl({configUrl: ClientConfiguration["config-url"]})
      .then(client => this.setState({client}))
      // eslint-disable-next-line no-console
      .catch(error => console.error(error));

    this.MergeContext = this.MergeContext.bind(this);
    this.UpdateContext = this.UpdateContext.bind(this);
  }

  async MergeContext(...args) {
    let newContext = {
      ...this.state
    };

    const newValue = args.pop();
    const lastKey = args.pop();
    const keys = args;

    let pointer = newContext;
    keys.forEach((key) => {
      pointer[key] = {
        ...pointer[key]
      };

      pointer = pointer[key];
    });

    if(typeof newValue === "object") {
      pointer[lastKey] = Object.assign(pointer[lastKey] || {}, newValue);
    } else {
      pointer[lastKey] = newValue;
    }

    await new Promise(resolve => this.setState(newContext, resolve));

    // Keep saved accounts up to date
    await SaveAccounts({accounts: newContext.accounts});

    return newContext;
  }

  async UpdateContext(newContext) {
    return new Promise(resolve =>
      this.setState(Object.assign(this.state, newContext), resolve)
    );
  }

  render() {
    if(!this.state.client) { return null; }

    const context = {
      ...this.state,
      MergeContext: this.MergeContext,
      UpdateContext: this.UpdateContext
    };

    return (
      <Provider value={context}>
        { this.props.children }
      </Provider>
    );
  }
}

export const ElvCoreConsumer = (Component) => {
  return (props) => (
    <Consumer>
      {(context) =>
        (
          Component.prototype.isReactComponent ?
            <Component {...props} context={context} /> :
            Component({context, props})
        )
      }
    </Consumer>
  );
};


