import React, { Fragment } from "react";
import { Link } from "react-router-dom";

export default class AccountLink extends React.Component {
  state = { alias: null };

  componentDidMount() {
    if (this.props.ninja) this.fetchAlias();
  }

  async fetchAlias() {
  }

  accountName() {
    const { name, account, short, ninja } = this.props;
    const { alias } = this.state;

    let accountName = name || account;
    if (!name && short) {
      accountName = `${account.substr(0, 9)}...${account.substr(-5)}`;
    }

    if (!name) {
      accountName = <span className="text-monospace">{accountName}</span>;
    }

    if (alias) {
      accountName = (
        <Fragment>
          <b>{alias}</b> - {accountName}
        </Fragment>
      );
    }

    return accountName;
  }

  render() {
    const {
      account,
      name,
      short,
      ninja,
      delegators,
      ...otherProps
    } = this.props;
    if (!account) return null;

    return (
      <Link
        className="break-word"
        to={`/explorer/account/${account}/${
          delegators ? "delegators" : "history"
        }`}
        {...otherProps}
      >
        {this.accountName()}
      </Link>
    );
  }
}
