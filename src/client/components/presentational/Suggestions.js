import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import sanitizeHtml from 'sanitize-html';
import './Suggestions.css';

function boldString(str, find) {
  var re = new RegExp(find, 'g');
  str = str.replace(re, '<b>' + find + '</b>');
  return str;
}

class Suggestions extends Component {
  constructor(props) {
    super(props);
    this.handleSuggestionClick = this.handleSuggestionClick.bind(this);
  }

  handleSuggestionClick = _id => event => {
    console.log('wt');
    this.props.history.push('/books/' + _id);
  };

  render() {
    if (!this.props.searchBarSuggestions.length) return '';
    const options = this.props.searchBarSuggestions.map(r => (
      <div
        key={r._id}
        onClick={this.handleSuggestionClick(r._id)}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(boldString(r.name, this.props.searchBarFilterText)) }}
      />
    ));
    return (
      <div className="autocomplete-items" id="myInputautocomplete-list">
        {options}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  searchBarSuggestions: state.searchBarSuggestions,
  searchBarFilterText: state.searchBarFilterText
});

export default connect(mapStateToProps)(withRouter(Suggestions));