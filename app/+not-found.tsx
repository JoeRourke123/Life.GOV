/** 404 — deadpan, on brand. */
import { Link } from 'expo-router';
import { GovScreen, InsetText } from '@/components/gov';
import { colors, type } from '@/theme';
import { Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <GovScreen>
      <Text style={type.display}>Not found</Text>
      <InsetText style={{ marginTop: 12 }}>
        This division was not found in the Order Paper.{' '}
        <Link href="/" style={{ color: colors.blue, fontWeight: '700', textDecorationLine: 'underline' }}>
          Return to No. 10
        </Link>
      </InsetText>
    </GovScreen>
  );
}
