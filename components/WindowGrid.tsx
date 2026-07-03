// components/WindowGrid.tsx
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";

export interface Moment {
  id: string;
  text: string; // text thường, text+emoji, hoặc chỉ emoji
}

interface WindowGridProps {
  moments: Moment[]; // mảng tối đa 4 phần tử, đã sort theo createdAt tăng dần
  onSlotPress?: () => void; // bấm vào ô trống -> mở compose
}

// Regex kiểm tra 1 chuỗi có phải "chỉ toàn emoji" hay không
// (bỏ khoảng trắng rồi check phần còn lại có match unicode Emoji property không)
function isEmojiOnly(text: string): boolean {
  const stripped = text.replace(/\s/g, "");
  if (stripped.length === 0) return false;
  return /^\p{Emoji}+$/u.test(stripped);
}

function MomentCard({
  moment,
  colors,
}: {
  moment: Moment;
  colors: typeof Colors.light;
}) {
  const emojiOnly = isEmojiOnly(moment.text);

  return (
    <View style={[styles.slot, { backgroundColor: colors.cardBackground }]}>
      <Text
        style={
          emojiOnly
            ? styles.emojiOnlyText
            : [styles.normalText, { color: colors.text }]
        }
        numberOfLines={emojiOnly ? 1 : 4}
      >
        {moment.text}
      </Text>
    </View>
  );
}

function EmptySlot({
  onPress,
  colors,
}: {
  onPress?: () => void;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable
      style={[
        styles.slot,
        styles.emptySlot,
        { borderColor: colors.emptyBorder },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.emptySlotPlus, { color: colors.emptyBorder }]}>
        +
      </Text>
    </Pressable>
  );
}

export default function WindowGrid({ moments, onSlotPress }: WindowGridProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Luôn có đúng 4 vị trí, slot nào chưa có moment thì render EmptySlot
  const slots = Array.from({ length: 4 }, (_, i) => moments[i] ?? null);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {slots[0] ? (
          <MomentCard moment={slots[0]} colors={colors} />
        ) : (
          <EmptySlot onPress={onSlotPress} colors={colors} />
        )}
        {slots[1] ? (
          <MomentCard moment={slots[1]} colors={colors} />
        ) : (
          <EmptySlot onPress={onSlotPress} colors={colors} />
        )}
      </View>
      <View style={styles.row}>
        {slots[2] ? (
          <MomentCard moment={slots[2]} colors={colors} />
        ) : (
          <EmptySlot onPress={onSlotPress} colors={colors} />
        )}
        {slots[3] ? (
          <MomentCard moment={slots[3]} colors={colors} />
        ) : (
          <EmptySlot onPress={onSlotPress} colors={colors} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: "100%", aspectRatio: 1, padding: 8 },
  row: { flex: 1, flexDirection: "row" },
  slot: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  normalText: { fontSize: 15, textAlign: "center" },
  emojiOnlyText: { fontSize: 40 },
  emptySlot: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "dashed",
  },
  emptySlotPlus: { fontSize: 20 },
});
