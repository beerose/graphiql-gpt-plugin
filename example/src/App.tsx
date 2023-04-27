import React from 'react';
import GraphiQL from 'graphiql';
// import { GraphiQLGptPlugin } from 'graphiql-gpt-plugin';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { useGptPlugin } from './plugin';
import 'graphiql/graphiql.min.css';

const fetcher = createGraphiQLFetcher({
  url: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
});

const App = () => {
  const [query, setQuery] = React.useState(
    'query AllFilms {\n  allFilms {\n    films {\n      title\n    }\n  }\n}',
  );
  const gptPlugin = useGptPlugin({
    onResult: setQuery,
  });

  return <GraphiQL fetcher={fetcher} query={query} onEditQuery={setQuery} plugins={[gptPlugin]} />;
};

export default App;
