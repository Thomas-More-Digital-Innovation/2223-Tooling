import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import { settingStore } from './settingStore';

let client = new ApolloClient({
	uri: 'https://api.github.com/graphql',
	headers: {
		authorization: `Bearer ${''}`
	},
	cache: new InMemoryCache()
});

settingStore.subscribe((newValue) => {
	client = new ApolloClient({
		uri: 'https://api.github.com/graphql',
		headers: {
			authorization: `Bearer ${newValue.GitHubPersonalAccessToken}`
		},
		cache: new InMemoryCache()
	});
});

export default client;
