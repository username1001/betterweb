import React, { Component } from 'react';  // eslint-disable-line
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateUser, updateGuest, fetchUsers } from './../actions/actions.js';
import { mappedTags } from './../config/usertags.js';

@connect(
  state => ({
    user: state.user,
    users: state.users
  }),
  dispatch => ({
    ...bindActionCreators({
      updateUser: updateUser,
      updateGuest: updateGuest,
      fetchUsers: fetchUsers
    }, dispatch),
    dispatch: dispatch
  })
)

class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      username: props.user.username,
      email: props.user.email,
      userTaken: false,
      emailTaken: false,
      gaDisabled: window['ga-disable-UA-110893275-1']
    };
  }

  updateUser(event) {
    event.preventDefault();
    const { closeModal, user, updateUser, dispatch } = this.props;
    closeModal();

    if(user.guest) {
      const { usertag, username } = event.target;
      const prefixed = new RegExp('guest','gi').test(username.value);
      dispatch({ type:'UPDATE_GUEST', payload: {
        uid: user.uid,
        username: ( !prefixed ? 'Guest ' : '' ) + username.value,
        usertag: usertag.value,
        guest: true
      }});
      return false;
    }

    const inputs = ['username', 'password', 'email', 'usertag'];
    let query = { uid: user.uid };
    inputs.forEach(e => {
      query = { ...query, [e]: event.target[e].value };
    });
    updateUser(query);
  }

  handlePass(e) {
    this.setState({
      password: e.target.value
    });
  }

  checkIfTaken(list, item, prop) {
    const search = new RegExp(`^${item}$`, 'i');
    const same = new RegExp(`^${this.props.user[prop]}$`, 'i');
    return list.map(e => e[prop] || null).find(v => search.test(v) && !same.test(v));
  }

  handleUser(e) {
    const { users } = this.props;
    const username = e.target.value;
    this.setState({
      username: e.target.value,
      userTaken: this.checkIfTaken(users.items, username, 'username')
    });
  }

  handleEmail(e) {
    const { users } = this.props;
    const email = e.target.value;
    this.setState({
      email: email,
      emailTaken: this.checkIfTaken(users.items, email, 'email')
    });
  }

  toggleGa() {
    window['ga-disable-UA-110893275-1'] = !window['ga-disable-UA-110893275-1'];
    this.setState({
      gaDisabled: window['ga-disable-UA-110893275-1']
    });
  }

  componentDidMount() {
    const { users, fetchUsers } = this.props;
    if(!users.items.length) {
      fetchUsers();
    }
  }

  render() {
    const { user, users } = this.props;
    const { password, username, email, userTaken, emailTaken, gaDisabled } = this.state;

    if(users.fetching || !users.items.length) {
      return (
        <section id='settings'>
          <div className='fetching'>
            <h1><i className='fa fa-spinner fa-spin' aria-hidden='true'></i></h1>
          </div>
        </section>
      );
    }

    const userForm = user.guest
      ? null
      : [
        <input key='password' type='password' name='password' placeholder='Password' value={password} onChange={e => this.handlePass(e)}/>,
        <input key='passwordValidator' type='password' name='passwordValidator' placeholder='Confirm password' pattern={password} title='Confirm password' required={!!password}/>,
        <input key='email' type='email' name='email' placeholder='Email (optional)' value={email} onChange={e => this.handleEmail(e)} className={emailTaken ? 'taken' : ''}/>
      ];

    const taken = (userTaken || emailTaken) && !user.guest;

    const buttonProp = {
      className: taken ? 'taken' : '',
      disabled: taken
    };

    const gaMsg = gaDisabled
      ? 'Help improve this site by letting us use cookies'
      : 'Opt out on cookie usage for google analytics';

    return (
      <section id='settings'>
        <form className='form' onSubmit={(e) => taken ? e.preventDefault() : this.updateUser(e)}>
          <input type='text' name='username' placeholder='Username' value={username} maxLength='20' onChange={e => this.handleUser(e)} className={userTaken && !user.guest ? 'taken' : ''}/>
          {userForm}
          <h3>Your tag</h3>
          <div>
            {mappedTags(user.usertag)}
          </div>
          <input type='submit' value='Update' {...buttonProp}/>
        </form>
        <button className='gamsg' onClick={() => this.toggleGa()}>{gaMsg}</button>
      </section>
    );
  }
}

export default Settings;