import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-6 pt-10">
          <Text className="text-[26px] font-bold text-ink-900 mb-1">Welcome back</Text>
          <Text className="text-[14px] text-ink-500 mb-8">Sign in to continue your order.</Text>

          <Text className="text-[13px] font-semibold text-ink-700 mb-1.5">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#94a3b8"
            className="border border-line rounded-xl px-4 h-12 text-[15px] text-ink-900 mb-4"
          />

          <Text className="text-[13px] font-semibold text-ink-700 mb-1.5">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            className="border border-line rounded-xl px-4 h-12 text-[15px] text-ink-900 mb-2"
          />

          {error ? <Text className="text-[13px] text-red-500 mb-3">{error}</Text> : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="bg-accent-orange rounded-xl h-12 items-center justify-center mt-4 flex-row gap-2"
          >
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-[15px]">Sign In</Text>}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} className="items-center mt-5">
            <Text className="text-ink-500 text-[14px]">Cancel</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
