import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/core';
import { db } from '../firebase'; // Assuming you have set up Firebase

const SearchPage = () => {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [randomUsers, setRandomUsers] = useState([]);

  useEffect(() => {
    // Fetch random users for display
    db.collection('users')
      .limit(15) // Limit to 15 random users
      .get()
      .then((querySnapshot) => {
        const users = querySnapshot.docs.map((doc) => doc.data());
        setRandomUsers(users);
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const usersRef = db.collection('users');
      const searchByName = usersRef
        .where('name', '>=', text)
        .where('name', '<=', text + '\uf8ff');
      const searchByEmail = usersRef
        .where('email', '>=', text)
        .where('email', '<=', text + '\uf8ff');
      const searchByPhoneNumber = usersRef
        .where('phoneNumber', '>=', text)
        .where('phoneNumber', '<=', text + '\uf8ff');

      const [nameSnapshot, emailSnapshot, phoneSnapshot] = await Promise.all([
        searchByName.get(),
        searchByEmail.get(),
        searchByPhoneNumber.get(),
      ]);

      const results = [
        ...nameSnapshot.docs,
        ...emailSnapshot.docs,
        ...phoneSnapshot.docs,
      ].map((doc) => doc.data());

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const renderUserItem = ({ item, index }) => (
    <TouchableOpacity style={styles.userBox} key={index}>
      <Text style={styles.userText}>{item.email}</Text>
    </TouchableOpacity>
  );

  const renderPlaceholderBox = () => (
    <View style={styles.placeholderBox}>
      <Text style={styles.placeholderText}>Placeholder</Text>
    </View>
  );

  const displayData = query ? searchResults.slice(0, 15) : randomUsers.slice(0, 15);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name, email, or phone number"
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {/* Display Profiles */}
      <FlatList
        data={displayData}
        renderItem={renderUserItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        key={query ? 'searched' : 'random'} // Change the key based on the query to avoid error
        contentContainerStyle={styles.resultsContainer}
        ListFooterComponent={renderPlaceholderBox} // Add the placeholder box at the end
      />
    </View>
  );
};

export default SearchPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
  },
  searchBarContainer: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    color: 'white',
  },
  resultsContainer: {
    paddingHorizontal: 10,
  },
  userBox: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    margin: 5,
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  userText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholderBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 5,
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120,
  },
  placeholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
