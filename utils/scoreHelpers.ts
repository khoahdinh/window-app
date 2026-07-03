// utils/scoreHelpers.ts
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

// Kiểm tra xem ngày "day" đã đủ cả 2 người gửi moment chưa,
// nếu đủ và chưa được tính điểm trước đó -> tăng sharedDaysCount lên 1
export async function maybeIncrementSharedDays(coupleId: string, day: string) {
  const scoredDayRef = doc(db, "couples", coupleId, "scoredDays", day);
  const coupleRef = doc(db, "couples", coupleId);

  await runTransaction(db, async (transaction) => {
    // Ngày này đã được tính điểm chưa?
    const scoredDaySnap = await transaction.get(scoredDayRef);
    if (scoredDaySnap.exists()) return;

    // Cả 2 user đã có moment trong ngày này chưa?
    const coupleSnap = await transaction.get(coupleRef);
    const members: string[] = coupleSnap.data()?.members ?? [];

    const momentsTodayQuery = query(
      collection(db, "moments"),
      where("coupleId", "==", coupleId),
      where("day", "==", day),
    );
    const momentsSnap = await getDocs(momentsTodayQuery);
    const authorsToday = new Set(
      momentsSnap.docs.map((d) => d.data().authorUid),
    );

    const bothPosted = members.every((uid) => authorsToday.has(uid));
    if (!bothPosted) return;

    // Đánh dấu ngày đã tính điểm + tăng counter
    transaction.set(scoredDayRef, { scoredAt: serverTimestamp() });
    transaction.update(coupleRef, {
      sharedDaysCount: (coupleSnap.data()?.sharedDaysCount ?? 0) + 1,
    });
  });
}
