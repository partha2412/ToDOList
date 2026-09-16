import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Login from '@/components/Login';

const setting = () => {
  return (
    <SafeAreaView>
      <View className=" h-screen bg-amber-00 items-center justify-center gap-10">
        <Text>Login</Text>
        <Login />
      </View>
    </SafeAreaView>
  );
}

export default setting