import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunkMiddleware, { ThunkAction } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import filtersReducer from './filtersReducer';
import searchResultReducer, { searchResultLoadingReducer } from './searchResultReducer';
import searchTextReducer from './searchTextReducer';
import { ActionTypes } from '../actions/actionTypes';
import { facetsReducer } from './facetsReducer';
import { errorReducer } from './errorReducer';
import sortByReducer from './sortByReducer';

const rootReducer = combineReducers({
    filters: filtersReducer,
    facets: facetsReducer,
    searchResult: searchResultReducer,
    searchText: searchTextReducer,
    sortBy: sortByReducer,
    searchResultLoading: searchResultLoadingReducer,
    error: errorReducer
})

export type ReduxState = ReturnType<typeof rootReducer>

export const reduxStore = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunkMiddleware))
)

export type ThunkResult<ReturnType = void> = ThunkAction<
    ReturnType,
    ReduxState,
    unknown,
    ActionTypes>