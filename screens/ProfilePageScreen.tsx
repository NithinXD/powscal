import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/core';
import { launchImageLibrary } from 'react-native-image-picker';
import { db, storage } from '../firebase';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;

  useEffect(() => {
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileDoc = await db.collection('users').doc(userId).get();
        if (profileDoc.exists) {
          setProfile(profileDoc.data());
        } else {
          console.error('Profile does not exist');
        }
      } catch (error) {
        console.error('Error fetching profile: ', error);
      }
    };

    const fetchPosts = async () => {
      try {
        const postsQuery = await db
          .collection('posts')
          .where('userId', '==', userId)
          .get();
        const userPosts = postsQuery.docs.map((doc) => doc.data());
        setPosts(userPosts);
      } catch (error) {
        console.error('Error fetching posts: ', error);
      }
    };

    fetchProfile();
    fetchPosts();
  }, [userId]);

  const handleAddPost = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        const uploadUri = selectedImage;
        const response = await fetch(uploadUri);
        const blob = await response.blob();
        const ref = storage.ref().child(`posts/${userId}/${Date.now()}`);
        const snapshot = await ref.put(blob);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        await db.collection('posts').add({
          userId,
          image: downloadUrl,
          timestamp: Date.now(),
        });
        fetchPosts();
      }
    });
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
    </View>
  );

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => {}}>
          <View style={styles.profileImageContainer}>
            {profile.profilePicture ? (
              <Image
                source={{ uri: profile.profilePicture }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Text style={styles.plusSign}>+</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.profileStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>177</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>280</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>

      {/* Profile Info */}
      <Text style={styles.profileName}>{profile.name}</Text>
      <Text style={styles.profileBio}>{profile.bio}</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editProfileButton}>
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promotionButton}>
          <Text style={styles.promotionButtonText}>Promotions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Story Highlights */}
      <View style={styles.storyHighlights}>
        <Text style={styles.storyHighlightsText}>Story Highlights</Text>
        <View style={styles.storyHighlightsContainer}>
          <View style={styles.storyCircle}>
            <Text style={styles.newStoryText}>New</Text>
          </View>
          <View style={styles.storyCirclePlaceholder} />
          <View style={styles.storyCirclePlaceholder} />
          <View style={styles.storyCirclePlaceholder} />
        </View>
      </View>

      {/* Posts */}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        contentContainerStyle={styles.postsContainer}
      />
    </View>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  profileImageContainer: {
    borderWidth: 2,
    borderColor: '#F77737',
    borderRadius: 50,
    padding: 3,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  defaultProfileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  profileStats: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'white',
    fontSize: 14,
  },
  profileName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginTop: 5,
  },
  profileBio: {
    color: 'white',
    fontSize: 14,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: '#262626',
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  editProfileButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  promotionButton: {
    flex: 1,
    backgroundColor: '#262626',
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  promotionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#262626',
    paddingVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  storyHighlights: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  storyHighlightsText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  storyHighlightsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  storyCirclePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#999',
    marginRight: 10,
  },
  newStoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postsContainer: {
    paddingHorizontal: 5,
  },
  postContainer: {
    flex: 1,
    margin: 5,
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
