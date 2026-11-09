import { NextResponse } from "next/server";
import courses from "@/data/courses";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseId, course, date, name, phone, people } = body;

    // 강좌 데이터에서 해당 강좌 조회
    const matchedCourse = courses.find(
      (c) =>
        (courseId !== undefined && c.id === Number(courseId)) ||
        (course && c.name === course)
    );

    if (!matchedCourse) {
      return NextResponse.json(
        { error: "해당 강좌를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    // 서버 측에서 인원 및 결제 금액(수강료 × 인원) 계산
    const numPeople = Math.max(1, parseInt(String(people), 10) || 1);
    const total = matchedCourse.price * numPeople;

    // .env의 SHEET_URL 확인 (브라우저에 노출되지 않음)
    const sheetUrl = process.env.SHEET_URL;
    if (!sheetUrl) {
      return NextResponse.json(
        { error: "서버에 SHEET_URL 환경 변수가 설정되어 있지 않습니다." },
        { status: 500 }
      );
    }

    // {date, course, name, phone, people, total} JSON 페이로드 구성
    const payload = {
      date: matchedCourse.date || date || "",
      course: matchedCourse.name,
      name: String(name || "").trim(),
      phone: String(phone || "").trim(),
      people: numPeople,
      total,
    };

    // Google Sheets 웹앱 URL로 JSON 전송
    const sheetResponse = await fetch(sheetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!sheetResponse.ok) {
      const errorText = await sheetResponse.text().catch(() => "");
      console.error("Google Sheet 전송 실패:", sheetResponse.status, errorText);
      return NextResponse.json(
        {
          error: "구글 시트로 데이터를 전송하는 중 문제가 발생했습니다.",
          status: sheetResponse.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "예약 신청이 성공적으로 접수되었습니다.",
      data: payload,
    });
  } catch (error: any) {
    console.error("예약 API 처리 오류:", error);
    return NextResponse.json(
      { error: "예약 처리 중 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

