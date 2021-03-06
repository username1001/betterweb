import axios from 'axios';
import { logAddPost, logAddComment, logUpvote } from './../config/google-analytics.js';

export function fetchUsers() {
  return (dispatch) => {
    dispatch({ type: 'USERS_FETCHING' });
    axios({
      url: '/api/fetchUsers'
    })
      .then(res => {
        dispatch({ type: 'USERS_FETCHED', payload: res.data });
      })
      .catch(err => {
        if(err) throw err;
        dispatch({ type: 'FAILED_USERS_FETCH' });
      });
  };
}

export function updateUser(query) {
  return (dispatch) => {
    axios({
      method: 'post',
      url: '/api/updateUser',
      params: query
    })
      .then(res => {
        dispatch({ type: 'UPDATED_USER', payload: res.data });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_USER_UPDATE' });
      });
  };
}

export function fetchPosts() {
  return (dispatch) => {
    dispatch({ type: 'FETCHING_POSTS' });
    axios({
      url: '/api/fetchPosts'
    })
      .then(res => {
        dispatch({ type: 'FETCHED_POSTS', payload: res.data });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_FETCH_POSTS' });
      });
  };
}

export function fetchOnePost(pid) {
  return (dispatch) => {
    dispatch({ type: 'FETCHING_ONE_POST' });
    axios({
      url: '/api/fetchOnePost',
      params: {
        pid: pid
      }
    })
      .then(res => {
        dispatch({ type: 'FETCHED_ONE_POST', payload: res.data });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_FETCH_ONE_POST' });
      });
  };
}

export function addPost(form, hidden) {
  return (dispatch) => {
    const data = new FormData(form);
    axios({
      method: 'post',
      url: '/api/addPost',
      params: {...hidden},
      data
    })
      .then(res => {
        logAddPost();
        dispatch({ type: 'server/ADDED_POST', payload: res.data });
        dispatch({ type: 'ADDED_POST_NOTIF' });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_ADD_POST' });
      });
  };
}

export function editPost(form, hidden) {
  return (dispatch) => {
    const data = new FormData(form);
    axios({
      method: 'post',
      url: '/api/editPost',
      params: {...hidden},
      data
    })
      .then(res => {
        dispatch({ type: 'server/UPDATED_POST', payload: res.data });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_UPDATE_POST' });
      });
  };
}

export function deletePost(post) {
  return (dispatch) => {
    axios({
      method: 'post',
      url: '/api/deletePost',
      params: post
    })
      .then(() => {
        dispatch({ type: 'server/DELETED_POST', payload: post.pid });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_DELETE_POST' });
      });
  };
}

export function upvote(item, user, type) {
  return(dispatch) => {
    axios({
      method: 'post',
      url: '/api/upvote',
      params: {
        ...item,
        user: user.uid,
        type: type
      }
    })
      .then(() => {
        logUpvote();
        dispatch({ type: 'server/UPVOTED_' + type.toUpperCase(), payload: { ...item, user: user.uid } });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_UPVOTE_' + type.toUpperCase() });
      });
  };
}

export function fetchComments() {
  return (dispatch) => {
    dispatch({ type: 'FETCHING_COMMENTS' });
    axios({
      url: '/api/fetchComments'
    })
      .then(res => {
        dispatch({ type: 'FETCHED_COMMENTS', payload: res.data });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_FETCH_COMMENTS' });
      });
  };
}

export function fetchPageComments(pid) {
  return (dispatch) => {
    dispatch({ type: 'FETCHING_PAGE_COMMENTS' });
    axios({
      url: '/api/fetchPageComments',
      params: {
        pid: pid
      }
    })
      .then(res => {
        dispatch({ type: 'FETCHED_PAGE_COMMENTS', payload: res.data, pid: pid });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_FETCH_PAGE_COMMENTS' });
      });
  };
}

export function addComment(form) {
  return (dispatch) => {
    axios({
      method: 'post',
      url: '/api/addComment',
      params: form
    })
      .then(res => {
        logAddComment();
        dispatch({ type: 'server/ADDED_COMMENT', payload: res.data, pid: form.pid });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_TO_COMMENT' });
      });
  };
}

export function deleteComment(query) {
  return (dispatch) => {
    axios({
      method: 'post',
      url: '/api/deleteComment',
      params: query
    })
      .then(() => {
        dispatch({ type: 'server/DELETED_COMMENT', payload: query });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_DELETE_COMMENT' });
      });
  };
}

export function postChecked(post) {
  return (dispatch) => {
    axios({
      method: 'post',
      url: '/api/checkPost',
      params: {
        pid: post.pid
      }
    })
      .then(() => {
        dispatch({ type: 'server/CHECKED_POST', payload: post.pid });
      })
      .catch(() => {
        dispatch({ type: 'FAILED_CHECK_POST' });
      });
  };
}