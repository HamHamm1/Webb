import { LoginForm } from "@/components/LoginForm";
import { getCurrentCustomer } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const c = await getCurrentCustomer().catch(() => null);
  if (c) redirect("/me");
  return (
    <div className="max-w-[430px] mx-auto">
      <div className="panel">
        <div className="ptitle justify-center">🔐 เข้าสู่ระบบ</div>
        <p className="muted text-center mb-4">
          ใช้ <b>รหัสชื่อ API</b> กับ <b>รหัสผ่าน</b> ที่แอดมินให้ไว้ (เปลี่ยนรหัสผ่านได้ทีหลังในหน้าบัญชี)
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
