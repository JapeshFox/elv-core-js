import React from "react";
import connect from "react-redux/es/connect/connect";
import Authenticate from "./Authenticate";
import RequestElement from "./components/RequestElement";
import {CroppedIcon, CroppedIconWithAction} from "./components/Icons";
import DefaultProfileImage from "../static/icons/account.svg";
import Link from "react-router-dom/es/Link";
import {EqualAddress} from "../utils/Helpers";

class Profile extends React.Component {
  constructor(props) {
    super(props);

    const accountAddress = props.match.params.accountAddress;
    this.state = {
      accountAddress,
      isCurrentAccount: EqualAddress(accountAddress, this.props.accounts.currentAccount.accountAddress),
      browseRef: React.createRef(),
      newName: ""
    };

    this.Profile = this.Profile.bind(this);
    this.HandleProfileImageChange = this.HandleProfileImageChange.bind(this);
    this.HandleNameChange = this.HandleNameChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      requestId: this.props.WrapRequest({
        todo: async () => {
          await this.props.GetProfileImage({client: this.props.client.client, accountAddress: this.state.accountAddress});
          await this.props.GetPublicUserProfile({client: this.props.client.client, accountAddress: this.state.accountAddress});
          await this.props.UpdateAccountBalance({client: this.props.client.client, accountAddress: this.state.accountAddress});

          if(this.state.isCurrentAccount) {
            await this.props.GetPrivateUserProfile({client: this.props.client.client});
          }

          this.setState({
            newName: this.UserProfile().publicMetadata.name
          });
        }
      })
    });
  }
  
  UserProfile() {
    return this.props.accounts.userProfiles[this.state.accountAddress];
  }

  HandleNameChange(event) {
    // Submit when enter is pressed
    if(event.key && event.key.toLowerCase() !== "enter") { return; }

    this.setState({
      updateProfileNameRequestId: this.props.WrapRequest({
        todo: async () => {
          await this.props.UpdatePublicProfileMetadata({client: this.props.client.client, metadataSubtree: "name", metadata: this.state.newName});
          await this.props.GetPublicUserProfile({client: this.props.client.client, accountAddress: this.state.accountAddress});

          this.setState({
            newName: "",
            modifyingName: false
          });
        }
      })
    });
  }

  HandleProfileImageChange(event) {
    this.setState({
      updateProfileImageRequestId: this.props.WrapRequest({
        todo: async () => {
          const image = await new Response(event.target.files[0]).blob();
          await this.props.SetProfileImage({client: this.props.client.client, image});
          await this.props.GetProfileImage({client: this.props.client.client, accountAddress: this.state.accountAddress});
        }
      })
    });
  }

  AccountActions() {
    return (
      <div className="actions-container account-actions centered">
        <Link className="action secondary" to="/accounts">
          Back
        </Link>
      </div>
    );
  }

  MetadataField(header, metadata) {
    if(!metadata) { metadata = {}; }

    const metadataFields = Object.keys(metadata).map(key => {
      let value = <span>{metadata[key]}</span>;
      if(typeof key === "object") {
        value = <pre>{JSON.stringify(metadata[key], null, 2)}</pre>;
      }

      return (
        <div className="labelled-field" key={`${header}-${key}`}>
          <label>{key}</label>
          {value}
        </div>
      );
    });

    return (
      <div className="info-section">
        <h4>{header}</h4>
        <div className="indented small-text">
          { metadataFields }
        </div>
      </div>
    );
  }

  ProfileImage() {
    const profileImage = this.UserProfile().profileImageUrl ? this.UserProfile().profileImageUrl : DefaultProfileImage;

    if(!this.state.isCurrentAccount) {
      return <CroppedIcon containerClassname="profile-image" icon={profileImage} title="Profile Image" />;
    }

    return (
      <RequestElement requests={this.props.requests} requestId={this.state.updateProfileImageRequestId}>
        <CroppedIconWithAction containerClassname="profile-image" icon={profileImage} title="Profile Image">
          <div title="Change Profile Image" className="change-profile-image" onClick={() => this.state.browseRef.current.click()}>
            <span>Change Profile Image</span>
            <input ref={this.state.browseRef} type="file" multiple={false} accept="image/*" hidden={true} onChange={this.HandleProfileImageChange}/>
          </div>
        </CroppedIconWithAction>
      </RequestElement>
    );
  }

  Name() {
    const name = this.UserProfile().publicMetadata.name || "Unknown Account";

    if(!this.state.isCurrentAccount) {
      return <h3 className="page-header">{name}</h3>;
    }

    if(this.state.modifyingName) {
      return (
        <div className="page-header modify-field">
          <input placeholder="Name" value={this.state.newName} onChange={(event) => this.setState({newName: event.target.value})} onKeyPress={this.HandleNameChange}/>
          <div className="actions-container inline-actions-container">
            <button className="action secondary action-compact" onClick={() => this.setState({modifyingName: false, newName: ""})}>Cancel</button>
            <button className="action action-compact" onClick={this.HandleNameChange}>Submit</button>
          </div>
        </div>
      );
    } else {
      const StartEditing = () => this.setState({modifyingName: true, newName: this.UserProfile().publicMetadata.name});
      return (
        <h3 tabIndex={0} className="page-header modifiable-field" onClick={StartEditing} onKeyPress={StartEditing}>
          {name}
        </h3>
      );
    }
  }

  Profile() {
    if(!this.UserProfile()) { return null; }

    const balance = this.props.accounts.balances[this.state.accountAddress];

    let privateMetadata;
    if(this.state.isCurrentAccount) {
      privateMetadata = this.MetadataField("Private Information", this.UserProfile().privateMetadata);
    }

    return (
      <div className="main-content-container">
        <div className="accounts user-profile">
          { this.AccountActions() }
          <div className="profile-image-container">
            { this.ProfileImage() }
          </div>
          <div className="user-info">
            <div className="page-header-container">
              { this.Name() }
              <span className="page-subheader">{this.state.accountAddress}</span>
              <span className="page-subheader">{balance}</span>
            </div>
            { this.MetadataField("Public Information", this.UserProfile().publicMetadata) }
            { privateMetadata }
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <RequestElement requestId={this.state.requestId} requests={this.props.requests} render={this.Profile}/>
    );
  }
}

export default connect(
  (state) => state
)(Authenticate(Profile));