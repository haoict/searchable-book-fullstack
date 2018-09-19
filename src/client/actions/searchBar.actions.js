export const changeSearchBarFilterText = searchBarFilterText => ({
  type: 'CHANGE_SEARCHBAR_FILTERTEXT',
  searchBarFilterText
});

export const fetchSearchBarSuggestionCompleted = searchBarSuggestions => ({
  type: 'FETCH_SEARCHBAR_SUGGESTIONS_COMPLETED',
  searchBarSuggestions
});

export const fetchSearchBarResultsCompleted = searchBarResults => ({
  type: 'FETCH_SEARCHBAR_RESUTLS_COMPLETED',
  searchBarResults
});
