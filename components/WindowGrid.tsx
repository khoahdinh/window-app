// components/WindowGrid.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";

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

function MomentCard({ moment }: { moment: Moment }) {
  const emojiOnly = isEmojiOnly(moment.text);

  return (
    <View style={styles.slot}>
      <Text
        style={emojiOnly ? styles.emojiOnlyText : styles.normalText}
        numberOfLines={emojiOnly ? 1 : 4}
      >
        {moment.text}
      </Text>
    </View>
  );
}

function EmptySlot({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable style={[styles.slot, styles.emptySlot]} onPress={onPress}>
      <Text style={styles.emptySlotPlus}>+</Text>
    </Pressable>
  );
}

export default function WindowGrid({ moments, onSlotPress }: WindowGridProps) {
  // Luôn có đúng 4 vị trí, slot nào chưa có moment thì render EmptySlot
  const slots = Array.from({ length: 4 }, (_, i) => moments[i] ?? null);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        {slots[0] ? (
          <MomentCard moment={slots[0]} />
        ) : (
          <EmptySlot onPress={onSlotPress} />
        )}
        {slots[1] ? (
          <MomentCard moment={slots[1]} />
        ) : (
          <EmptySlot onPress={onSlotPress} />
        )}
      </View>
      <View style={styles.row}>
        {slots[2] ? (
          <MomentCard moment={slots[2]} />
        ) : (
          <EmptySlot onPress={onSlotPress} />
        )}
        {slots[3] ? (
          <MomentCard moment={slots[3]} />
        ) : (
          <EmptySlot onPress={onSlotPress} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    aspectRatio: 1, // giữ khung vuông tổng thể, giống 1 cửa sổ 4 ô kính thật
    padding: 8,
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  slot: {
    flex: 1,
    margin: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5", // thẻ trung tính, không phải bong bóng chat
  },
  normalText: {
    fontSize: 15,
    textAlign: "center",
    color: "#333",
  },
  emojiOnlyText: {
    fontSize: 40, // to hơn hẳn khi chỉ có emoji đứng 1 mình
  },
  emptySlot: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D8D8D8", // viền mờ, im lặng, không nhắc nhở
  },
  emptySlotPlus: {
    fontSize: 20,
    color: "#D8D8D8", // nhạt, chỉ đủ gợi ý chứ không thúc giục
  },
});
