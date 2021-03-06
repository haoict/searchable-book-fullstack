import React, { Component } from 'react';
import { connect } from 'react-redux';
import { userService } from 'src/client/services';
import { toast } from 'react-toastify';
import { toastOptions } from 'src/client/config';
import './AccountSettings.Profile.css';

class AccountSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        email: '',
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
        hasPassword: false
      },
      submitted: false,
      processing: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleuserSubmit = this.handleuserSubmit.bind(this);
  }

  handleChange(event) {
    const { user } = this.state;
    user[event.target.name] = event.target.value;
    this.setState({
      user
    });
  }

  handleuserSubmit(event) {
    event.preventDefault();
    const { user } = this.state;
    const mainProps = this.props;
    this.setState({
      submitted: true
    });
    user.email = mainProps.user.email;
    if (!user.email) {
      return;
    }
    if (user.newPassword === '') {
      return;
    }
    if (user.newPassword !== user.newPasswordConfirm) {
      return;
    }
    if (mainProps.user.hasPassword && user.currentPassword === '') {
      return;
    }
    this.setState({
      processing: true
    });
    userService.changePassword(user).then(
      () => {
        toast('✅ Change password success!', toastOptions.INFO);
        this.setState({
          user: {
            currentPassword: '',
            newPassword: '',
            newPasswordConfirm: '',
            hasPassword: true
          },
          submitted: false,
          processing: false
        });
      },
      (error) => {
        toast(`❌ ${error}`, toastOptions.ERROR);
      }
    );
  }

  render() {
    const { user, submitted, processing } = this.state;
    const mainProps = this.props;
    return (
      <div className="profile-account-settings-container">
        <h3>Change password</h3>
        <form name="form" onSubmit={this.handleuserSubmit}>
          {(mainProps.user.hasPassword || user.hasPassword) && (
            <div className="form-group">
              <label htmlFor="password">Current Password</label>
              <input
                type="password"
                className="form-control"
                name="currentPassword"
                onChange={this.handleChange}
                onBlur={this.handleChange}
                value={user.currentPassword}
              />
              {submitted
                && !user.currentPassword && (
                  <div className="help-block">Current password is required</div>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              className="form-control"
              name="newPassword"
              onChange={this.handleChange}
              onBlur={this.handleChange}
              value={user.newPassword}
            />
            {submitted
              && !user.newPassword && <div className="help-block">Password is required</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password Confirm</label>
            <input
              type="password"
              className="form-control"
              name="newPasswordConfirm"
              onChange={this.handleChange}
              onBlur={this.handleChange}
              value={user.newPasswordConfirm}
            />
            {submitted
              && user.newPasswordConfirm !== user.newPassword && (
                <div className="help-block">Confirm new password must match</div>
            )}
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            {processing && (
              <img
                alt="processing"
                src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA=="
              />
            )}
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(AccountSettings);
