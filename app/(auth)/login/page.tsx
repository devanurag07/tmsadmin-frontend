
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="w-full min-h-screen flex items-center justify-center">

            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-xs">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
