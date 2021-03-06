import React, { Component } from 'react'; // eslint-disable-line
import { connect } from 'react-redux';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import NewPost from './PostSubmit.js';
import Settings from './Settings.js';
import Login from './../containers/Login.js';

@connect(
  state => ({
    user: state.user,
    posts: state.posts
  })
)

class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newPostModal: false,
      settingsModal: false,
      loginModal: false,
      menuOpen: false
    };
  }

  componentDidMount() {
    const { search } = this.props.location;
    if(search == '?failed') {
      this.setState({
        loginModal: true,
        loginFailed: true
      });
    }
  }

  toggleMenu() {
    this.setState({
      menuOpen: !this.state.menuOpen
    });
  }

  closeMenu() {
    this.setState({
      menuOpen: false
    });
  }

  openNewPost() {
    this.setState({
      newPostModal: true
    });
  }

  closeNewPost() {
    this.setState({
      newPostModal: false
    });
  }

  openSettings() {
    this.setState({
      settingsModal: true
    });
  }

  closeSettings() {
    this.setState({
      settingsModal: false
    });
  }

  openLogin() {
    this.setState({
      loginModal: true
    });
  }

  closeLogin() {
    this.setState({
      loginModal: false,
      loginFailed: false
    });
  }

  render() {
    const { user, posts } = this.props;
    const { newPostModal, settingsModal, loginModal, loginFailed, menuOpen } = this.state;

    const OpenLinkModal = (props) => (
      <li><a className={props.className} onClick={props.openModal}>{props.children}</a></li>
    );

    const NavModal = (props) => (
      <Modal className='modal' isOpen={props.openState} onRequestClose={props.closeFn} shouldCloseOnOverlayClick={false}>
        <div>
          <button className='modal-close' onClick={props.closeFn}><i className='fa fa-times' aria-hidden='true'></i></button>
          {props.children}
        </div>
      </Modal>
    );

    // common nav buttons
    const newPostButton = <OpenLinkModal className='standout' openModal={() => this.openNewPost()}>New+</OpenLinkModal>;
    const settingsButton = (
      <OpenLinkModal openModal={() => this.openSettings()}>
        { user.guest
          ? <div>Guest</div>
          : <div>Me <span className='ups-display'><i className='fa fa-star-o' aria-hidden='true'></i> {user.ups}</span></div> }
      </OpenLinkModal>
    );

    // check for newComment
    const newComments = posts.items.filter(e => e.uid === user.uid && e.newComment);

    // make nav buttons
    const nav = user.guest
      ? (
        <ul>
          {newPostButton}
          {settingsButton}
          <OpenLinkModal openModal={() => this.openLogin()}>Log in</OpenLinkModal>
        </ul>
      )
      : (
        <ul>
          {newPostButton}
          <li><Link to={'/user/' + user.uid}>My post {newComments.length ? <sup>{newComments.length}</sup> : null}</Link></li>
          {settingsButton}
          <li><a href='/signout'>Sign out</a></li>
        </ul>
      );

    const menuClass = 'menu ' + (menuOpen ? '' : ' no-menu');

    return (
      <section id='nav'>
        <span className='betterweb-logo'>
          <Link to='/'><img src='/src/img/betterweb-logo.png' alt='logo'/></Link>
        </span>

        <button className='dropdown' onClick={() => this.toggleMenu()}>Menu <i className='fa fa-chevron-down' aria-hidden='true'></i></button>

        <div className={menuClass} onClick={() => this.closeMenu()}>
          {nav}
        </div>

        {/* -- MODALS -- */}
        <NavModal className='newpost-modal' openState={newPostModal} closeFn={() => this.closeNewPost()}>
          <NewPost user={user} closeModal={() => this.closeNewPost()}/>
        </NavModal>
        <NavModal className='settings-modal' openState={settingsModal} closeFn={() => this.closeSettings()}>
          <Settings user={user} closeModal={() => this.closeSettings()}/>
        </NavModal>
        <NavModal className='login-modal' openState={loginModal} closeFn={() => this.closeLogin()}>
          <Login loginFailed={loginFailed}/>
        </NavModal>
      </section>
    );
  }
}
export default Nav;