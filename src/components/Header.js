import "../static/stylesheets/header.scss";

import React from "react";
import {
  IconButton,
  IconLink,
} from "elv-components-js";
import {inject, observer} from "mobx-react";

import Logo from "../static/images/Logo.png";
import ShowHeaderIcon from "../static/icons/ShowHeader.svg";
import {withRouter} from "react-router";
import AccountDropdown from "./AccountDropdown";

@inject("rootStore")
@observer
class Header extends React.Component {
  ToggleHeader(show) {
    this.props.rootStore.ToggleHeader(show);
  }

  render() {
    return (
      <header className={this.props.rootStore.showHeader ? "header" : "header hidden-header"}>
        <IconButton className="toggle-header-button" icon={ShowHeaderIcon} label="Show Header" onClick={() => this.ToggleHeader(true)} />
        <IconLink icon={Logo} to="/apps" className="logo" />
        <div
          className="toggle-header-section"
          title="Hide Header"
          aria-label="Hide Header"
          tabIndex={0}
          onClick={() => this.ToggleHeader(false)}
          onKeyPress={() => this.ToggleHeader(false)}
        />
        <AccountDropdown />
      </header>
    );
  }
}

export default withRouter(Header);
