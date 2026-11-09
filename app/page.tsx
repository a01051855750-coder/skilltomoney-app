"use client";

import { useState } from "react";
import courses from "@/data/courses";

export default function Home() {
  const [availableOnly, setAvailableOnly] = useState(false);

  // 예약 신청 모달 상태
  const [selectedCourse, setSelectedCourse] = useState<(typeof courses)[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    people: 1,
  });

  const handleOpenModal = (course: (typeof courses)[0]) => {
    setSelectedCourse(course);
    setFormData({
      name: "",
      phone: "",
      people: 1,
    });
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
  };

  // 예약 신청 제출 핸들러 (서버 API 호출)
  const handleSubmitReservation = async () => {
    if (!selectedCourse || isSubmitting) return;

    if (!formData.name.trim()) {
      alert("이름을 입력해 주세요.");
      return;
    }
    if (!formData.phone.trim()) {
      alert("연락처를 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          course: selectedCourse.name,
          date: selectedCourse.date,
          name: formData.name,
          phone: formData.phone,
          people: formData.people,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "예약 신청 처리 중 오류가 발생했습니다.");
      }

      const totalFormatted = data.data?.total?.toLocaleString();
      alert(`예약 신청이 성공적으로 접수되었습니다!${totalFormatted ? `\n(총 결제 금액: ${totalFormatted}원)` : ""}`);
      handleCloseModal();
    } catch (err: any) {
      alert(err.message || "예약 신청 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 남은 자리(seat - booked > 0)가 있는 강좌만 필터링
  const filteredCourses = availableOnly
    ? courses.filter((course) => course.seat - course.booked > 0)
    : courses;

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between bg-[#0A1128] text-white selection:bg-amber-400 selection:text-slate-950 overflow-hidden">
      {/* 배경 은은한 금색 & 남색 앰비언트 글로우 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] sm:w-[650px] h-[350px] sm:h-[450px] bg-gradient-to-b from-amber-500/15 via-blue-600/10 to-transparent rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-5 w-[250px] h-[250px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -z-0" />

      {/* 상단 헤더 */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]" />
          <span className="font-black text-lg sm:text-xl tracking-wider text-white">
            스킬투머니
          </span>
          <span className="text-xs text-amber-300/80 font-mono tracking-widest hidden sm:inline ml-1">
            SKILL TO MONEY
          </span>
        </div>
        <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
          원데이 클래스 모집 중
        </span>
      </header>

      {/* 메인 강좌 목록 섹션 */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 py-12 sm:py-16 max-w-6xl mx-auto w-full">
        {/* 섹션 제목 및 헤딩 */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-medium mb-4">
            ✨ 배운 기술이 돈이 되는 원데이 클래스
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
            스킬투머니 강좌 목록
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed break-keep">
            단 하루 만에 실전에 바로 써먹고 수익화로 이어지는 알짜 클래스를 만나보세요.
          </p>
        </div>

        {/* 필터 컨트롤 바: 예약 가능한 강좌만 보기 체크박스 */}
        <div className="w-full flex items-center justify-between mb-6 px-1">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-slate-200 hover:text-amber-300 transition-colors">
            <input
              type="checkbox"
              id="filter-available"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-400 focus:ring-amber-400 focus:ring-offset-slate-900 cursor-pointer accent-amber-400"
            />
            <span className="font-semibold">예약 가능한 강좌만 보기</span>
          </label>
          <span className="text-xs text-slate-400">
            총 <strong className="text-amber-300 font-bold">{filteredCourses.length}</strong>개 강좌
          </span>
        </div>

        {/* 강좌 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {filteredCourses.map((course) => {
            // 남은 좌석 계산: 정원(seat) - 예약(booked)
            const remainingSeats = course.seat - course.booked;
            const isSoldOut = remainingSeats <= 0;
            const isUrgent = remainingSeats >= 1 && remainingSeats <= 2;

            return (
              <div
                key={course.id}
                className={`group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 border p-6 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 ${
                  isSoldOut
                    ? "border-slate-800 opacity-80"
                    : "border-amber-400/20 hover:-translate-y-1.5 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-500/10"
                }`}
              >
                <div>
                  {/* 상단: 상태 뱃지, 날짜 */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {/* 상태 뱃지: 남은 좌석이 0이면 '마감', 1~2석이면 '마감 임박(빨간색)' */}
                      {isSoldOut ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                          마감
                        </span>
                      ) : isUrgent ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse">
                          <span>🔥 마감 임박</span>
                        </span>
                      ) : null}
                    </div>

                    <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-1">
                      📅 {course.date}
                    </span>
                  </div>

                  {/* 아이콘 & 강좌 이름 */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl p-2 rounded-xl bg-white/[0.05] border border-white/5">
                      {course.icon || "📚"}
                    </span>
                    <h2
                      className={`text-xl font-bold transition-colors ${
                        isSoldOut ? "text-slate-300" : "text-white group-hover:text-amber-300"
                      }`}
                    >
                      {course.name}
                    </h2>
                  </div>

                  {/* 강좌 이름 아래 작은 배지 태그들 */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                    {Array.isArray(course.tags) ? (
                      course.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300">
                        {course.tags}
                      </span>
                    )}
                  </div>

                  {/* 강좌 설명 */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-keep min-h-[38px] mb-4">
                    {course.description || "실전 수익화 원데이 클래스"}
                  </p>

                  {/* 좌석 현황 박스: 남은 좌석 ○석 / 정원 ○명 (상태별 색상 처리) */}
                  <div
                    className={`mb-6 p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      isSoldOut
                        ? "bg-slate-800/40 border-slate-700/60"
                        : isUrgent
                        ? "bg-red-500/10 border-red-500/30"
                        : "bg-white/[0.04] border-white/10"
                    }`}
                  >
                    <span className="text-xs text-slate-400 font-medium">
                      좌석 현황
                    </span>
                    <div className="flex items-center gap-2">
                      {/* 상태 텍스트 */}
                      {isSoldOut ? (
                        <span className="text-xs font-bold text-slate-400">
                          [마감] 0석
                        </span>
                      ) : isUrgent ? (
                        <span className="text-xs font-bold text-red-400">
                          [마감 임박] {remainingSeats}석
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-300">
                          남은 좌석 {remainingSeats}석
                        </span>
                      )}

                      <span className="text-xs text-slate-500">/</span>
                      <span className="text-xs text-slate-300 font-medium">
                        정원 {course.seat}명
                      </span>
                    </div>
                  </div>
                </div>

                {/* 하단: 수강료 & 예약하기 버튼 */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-xs text-slate-400 font-medium">수강료</span>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
                          isSoldOut ? "text-slate-400" : "text-amber-300"
                        }`}
                      >
                        {course.price.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-300">원</span>
                    </div>
                  </div>

                  {/* 예약하기 버튼: 남은 좌석이 0이면 [예약 마감] disabled 처리 */}
                  {isSoldOut ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed flex items-center justify-center gap-2 select-none"
                    >
                      <span>예약 마감</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenModal(course)}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>예약하기</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 하단 안내 텍스트 */}
        <div className="mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-400 break-keep">
            💡 모든 클래스는 소수 정예 실습형으로 진행되며, 선착순으로 마감됩니다.
          </p>
        </div>
      </main>

      {/* 예약 신청 창 (모달) */}
      {selectedCourse && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-amber-400/30 p-6 sm:p-8 shadow-2xl shadow-black/80 text-white">
            {/* 모달 상단 헤더 */}
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300">
                  원데이 클래스 예약
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mt-2 text-white">
                  예약 신청
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 cursor-pointer"
                aria-label="창 닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {/* 강좌 이름 (자동 채움) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  강좌 이름
                </label>
                <input
                  type="text"
                  value={selectedCourse.name}
                  readOnly
                  aria-readonly="true"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-amber-300 font-bold text-sm outline-none cursor-not-allowed select-none"
                />
              </div>

              {/* 강좌 날짜 (자동 채움) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  강좌 날짜
                </label>
                <input
                  type="text"
                  value={selectedCourse.date}
                  readOnly
                  aria-readonly="true"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 font-medium text-sm outline-none cursor-not-allowed select-none"
                />
              </div>

              {/* 이름 입력 칸 */}
              <div>
                <label htmlFor="modal-name" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  이름
                </label>
                <input
                  id="modal-name"
                  type="text"
                  placeholder="예: 홍길동"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none transition-colors placeholder:text-slate-500"
                />
              </div>

              {/* 연락처 입력 칸 */}
              <div>
                <label htmlFor="modal-phone" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  연락처
                </label>
                <input
                  id="modal-phone"
                  type="tel"
                  placeholder="예: 010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none transition-colors placeholder:text-slate-500"
                />
              </div>

              {/* 인원 (숫자) 입력 칸 */}
              <div>
                <label htmlFor="modal-people" className="block text-xs font-semibold text-slate-300 mb-1.5">
                  인원 (숫자)
                </label>
                <input
                  id="modal-people"
                  type="number"
                  min={1}
                  value={formData.people}
                  onChange={(e) => setFormData({ ...formData, people: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-amber-400 text-white text-sm outline-none transition-colors"
                />
              </div>

              {/* 하단 [닫기] 및 [신청] 버튼 */}
              <div className="pt-4 mt-6 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReservation}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-amber-400/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>신청 중...</span>
                    </>
                  ) : (
                    <span>신청</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer className="relative z-10 w-full text-center py-6 text-xs text-slate-400 border-t border-white/5">
        <p>© 2026 스킬투머니 (Skill to Money). All rights reserved.</p>
      </footer>
    </div>
  );
}
