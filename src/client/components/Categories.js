import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import AllCategories from './AllCategories';
import Category from './Category';
import NotFoundRoute from './NotFoundRoute';

const Categories = () => (
  <Switch>
    <Route exact path="/categories" component={AllCategories} />
    <Route exact path="/categories/:id" component={Category} />
    <Route component={NotFoundRoute} />
  </Switch>
);

export default Categories;
