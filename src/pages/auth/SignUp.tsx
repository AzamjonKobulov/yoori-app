import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts";
import { apiCP, apiID } from "../../http/apis";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasMixedCase: false,
    hasSpecialChars: false,
  });
  const [showPasswordValidation, setShowPasswordValidation] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // Auth context available if needed

  useEffect(() => {
    setCode(location.state?.code);
    console.log(location.state?.code);
  }, [location.state]);

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
    const hasSpecialChars = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
      password
    );

    setPasswordValidation({
      minLength,
      hasMixedCase,
      hasSpecialChars,
    });
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = event.target.value;
    setPassword(newPassword);

    // Show validation rules when user starts typing
    if (newPassword.length > 0) {
      setShowPasswordValidation(true);
    }

    validatePassword(newPassword);

    // Check password mismatch when password changes
    if (confirmPassword.length > 0) {
      setPasswordMismatch(newPassword !== confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newConfirmPassword = event.target.value;
    setConfirmPassword(newConfirmPassword);

    // Check if passwords match
    setPasswordMismatch(
      password !== newConfirmPassword && newConfirmPassword.length > 0
    );
  };

  const handleDomainChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDomain = event.target.value;
    setDomain(newDomain);

    // Show suggestions when user starts typing
    if (newDomain.length > 0) {
      setShowDomainSuggestions(true);
    }
  };

  // Mock domain suggestions - in real app, this would come from API
  const domainSuggestions = [
    "yandex.google.test",
    "yahoo.google.test",
    "mail.google.test",
  ];

  async function register(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate password match
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (
      !passwordValidation.minLength ||
      !passwordValidation.hasMixedCase ||
      !passwordValidation.hasSpecialChars
    ) {
      setError("Пароль не соответствует требованиям безопасности");
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiID.post(`/auth/v1/${code}/register/`, {
        first_name: name,
        password,
        phone,
        domain,
        patronymic: "empty",
        last_name: "empty",
      });

      // Store tokens and get user info
      localStorage.setItem("accessToken", res.data.access_token);
      localStorage.setItem("refreshToken", res.data.refresh_token);

      const userInfo = await apiCP.get("/user/v1/current/info");
      localStorage.setItem("manager_id", userInfo.data.id);
      apiCP.defaults.baseURL = `https://${userInfo.data.domain}`;

      // Update auth context
      window.location.reload(); // This will trigger the auth context to check tokens
      navigate("/");
    } catch (err) {
      console.log(err);
      setError("Произошла ошибка при регистрации. Попробуйте еще раз.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 size-screen z-50 flex-center bg-base-chart-3 bg-auth bg-no-repeat bg-center bg-cover">
      <div className="flex flex-col items-center gap-6">
        <img src="/assets/images/logo.svg" alt="Logo" />
        {/* Form */}
        <div className="w-96 max-h-[85vh] text-sm/3.5 bg-white border border-base-border rounded-lg overflow-auto p-6">
          <form action="#" className="space-y-6">
            <h3 className="text-xl font-semibold text-center ">
              Заполните данные и создайте профиль
            </h3>

            <div className="space-y-2">
              <label htmlFor="name" className="block font-semibold">
                Ваше имя
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full h-9 border border-base-border outline-none focus:ring-2 ring-base-border placeholder:text-base-muted-foreground rounded-md px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block font-semibold">
                Номер телефона
              </label>

              <input
                id="phone"
                type="text"
                onChange={(event) => setPhone(event.target.value)}
                className="w-full h-9 border border-base-border outline-none focus:ring-2 ring-base-border placeholder:text-base-muted-foreground rounded-md px-3"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block font-semibold">
                Пароль
              </label>

              <div className="relative">
                <input
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  type={showPassword ? "text" : "password"}
                  className="w-full h-9 border border-base-border outline-none focus:ring-2 ring-base-border placeholder:text-base-muted-foreground rounded-md pl-3 pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-base-muted-foreground"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-base-muted-foreground"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="m10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Validation Rules - Only show when user starts typing */}
              {showPasswordValidation && (
                <div className="border border-base-border rounded-md p-1">
                  <div className="flex items-center gap-2 py-1.5 px-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_2546_37599)">
                        <path
                          d="M14.6668 7.38674V8.00007C14.666 9.43769 14.2005 10.8365 13.3397 11.988C12.4789 13.1394 11.269 13.9817 9.8904 14.3893C8.51178 14.797 7.03834 14.748 5.68981 14.2498C4.34128 13.7516 3.18993 12.8308 2.40747 11.6248C1.62501 10.4188 1.25336 8.99212 1.34795 7.55762C1.44254 6.12312 1.9983 4.75762 2.93235 3.66479C3.8664 2.57195 5.12869 1.81033 6.53096 1.4935C7.93323 1.17668 9.40034 1.32163 10.7135 1.90674M6.00016 7.33333L8.00016 9.33333L14.6668 2.66667"
                          stroke={
                            passwordValidation.minLength ? "#10B981" : "#9CA3AF"
                          }
                          stroke-width="1.33"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2546_37599">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                    <span
                      className={`text-sm/5 ${
                        passwordValidation.minLength
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Не менее 8 символов
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-1.5 px-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_2546_37599)">
                        <path
                          d="M14.6668 7.38674V8.00007C14.666 9.43769 14.2005 10.8365 13.3397 11.988C12.4789 13.1394 11.269 13.9817 9.8904 14.3893C8.51178 14.797 7.03834 14.748 5.68981 14.2498C4.34128 13.7516 3.18993 12.8308 2.40747 11.6248C1.62501 10.4188 1.25336 8.99212 1.34795 7.55762C1.44254 6.12312 1.9983 4.75762 2.93235 3.66479C3.8664 2.57195 5.12869 1.81033 6.53096 1.4935C7.93323 1.17668 9.40034 1.32163 10.7135 1.90674M6.00016 7.33333L8.00016 9.33333L14.6668 2.66667"
                          stroke={
                            passwordValidation.hasMixedCase
                              ? "#10B981"
                              : "#9CA3AF"
                          }
                          stroke-width="1.33"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2546_37599">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                    <span
                      className={`text-sm/5 ${
                        passwordValidation.hasMixedCase
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Содержит разный регистр
                    </span>
                  </div>

                  <div className="flex items-center gap-2 py-1.5 px-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clip-path="url(#clip0_2546_37599)">
                        <path
                          d="M14.6668 7.38674V8.00007C14.666 9.43769 14.2005 10.8365 13.3397 11.988C12.4789 13.1394 11.269 13.9817 9.8904 14.3893C8.51178 14.797 7.03834 14.748 5.68981 14.2498C4.34128 13.7516 3.18993 12.8308 2.40747 11.6248C1.62501 10.4188 1.25336 8.99212 1.34795 7.55762C1.44254 6.12312 1.9983 4.75762 2.93235 3.66479C3.8664 2.57195 5.12869 1.81033 6.53096 1.4935C7.93323 1.17668 9.40034 1.32163 10.7135 1.90674M6.00016 7.33333L8.00016 9.33333L14.6668 2.66667"
                          stroke={
                            passwordValidation.hasSpecialChars
                              ? "#10B981"
                              : "#9CA3AF"
                          }
                          stroke-width="1.33"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_2546_37599">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                    <span
                      className={`text-sm/5 ${
                        passwordValidation.hasSpecialChars
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      Включает специальные символы
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password-confirm" className="block font-semibold">
                Подтвердите пароль
              </label>

              <div className="relative">
                <input
                  id="password-confirm"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full h-9 border outline-none focus:ring-2 placeholder:text-base-muted-foreground rounded-md pl-3 pr-10 ${
                    passwordMismatch
                      ? "border-red-500 focus:ring-red-500"
                      : "border-base-border focus:ring-base-border"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-base-muted-foreground"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stroke-base-muted-foreground"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="m10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Mismatch Warning */}
              {passwordMismatch && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 14.6667C11.6819 14.6667 14.6667 11.6819 14.6667 8C14.6667 4.31814 11.6819 1.33333 8 1.33333C4.31814 1.33333 1.33333 4.31814 1.33333 8C1.33333 11.6819 4.31814 14.6667 8 14.6667Z"
                      stroke="#DC2626"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 5.33333V8"
                      stroke="#DC2626"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 10.6667H8.00667"
                      stroke="#DC2626"
                      strokeWidth="1.33"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Пароли не совпадают</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="sub-domen" className="block font-semibold">
                Поддомен
              </label>

              <div className="relative">
                <input
                  id="sub-domen"
                  type="text"
                  value={domain}
                  onChange={handleDomainChange}
                  className="w-full h-9 border border-base-border outline-none focus:ring-2 ring-base-border placeholder:text-base-muted-foreground rounded-md pl-3 pr-10"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base-muted-foreground">
                  .yoori.pro
                </span>
              </div>

              {/* Domain Suggestions - Only show when user starts typing */}
              {showDomainSuggestions && (
                <div className="bg-white border border-base-border divide-y divide-base-border rounded-md p-1 space-y-2">
                  <div className="flex gap-2 text-base-muted-foreground px-2 p-1.5">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0 mt-1"
                    >
                      <g clip-path="url(#clip0_755_287770)">
                        <path
                          d="M8.00016 5.33335V8.00002M8.00016 10.6667H8.00683M2.5668 5.74675C2.46949 5.30844 2.48443 4.85265 2.61023 4.42164C2.73604 3.99064 2.96863 3.59838 3.28644 3.28123C3.60425 2.96408 3.997 2.73231 4.42827 2.60741C4.85953 2.48252 5.31535 2.46853 5.75346 2.56675C5.9946 2.18962 6.3268 1.87926 6.71943 1.66428C7.11206 1.44929 7.55249 1.33661 8.00013 1.33661C8.44776 1.33661 8.8882 1.44929 9.28083 1.66428C9.67346 1.87926 10.0057 2.18962 10.2468 2.56675C10.6856 2.4681 11.1422 2.48202 11.5741 2.60723C12.0061 2.73243 12.3994 2.96485 12.7174 3.28285C13.0354 3.60086 13.2678 3.99413 13.393 4.42609C13.5182 4.85804 13.5321 5.31464 13.4335 5.75342C13.8106 5.99456 14.121 6.32675 14.3359 6.71939C14.5509 7.11202 14.6636 7.55245 14.6636 8.00008C14.6636 8.44772 14.5509 8.88815 14.3359 9.28078C14.121 9.67342 13.8106 10.0056 13.4335 10.2468C13.5317 10.6849 13.5177 11.1407 13.3928 11.5719C13.2679 12.0032 13.0361 12.396 12.719 12.7138C12.4018 13.0316 12.0096 13.2642 11.5786 13.39C11.1476 13.5158 10.6918 13.5307 10.2535 13.4334C10.0126 13.812 9.68018 14.1237 9.28688 14.3396C8.89358 14.5556 8.45215 14.6688 8.00346 14.6688C7.55478 14.6688 7.11335 14.5556 6.72004 14.3396C6.32674 14.1237 5.99429 13.812 5.75346 13.4334C5.31535 13.5316 4.85953 13.5177 4.42827 13.3928C3.997 13.2679 3.60425 13.0361 3.28644 12.7189C2.96863 12.4018 2.73604 12.0095 2.61023 11.5785C2.48443 11.1475 2.46949 10.6917 2.5668 10.2534C2.18677 10.0129 1.87374 9.6802 1.65683 9.28623C1.43992 8.89226 1.32617 8.44982 1.32617 8.00008C1.32617 7.55035 1.43992 7.10791 1.65683 6.71394C1.87374 6.31997 2.18677 5.98726 2.5668 5.74675Z"
                          stroke="#DC2626"
                          stroke-width="1.33"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_755_287770">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>

                    <span className="text-sm/5">
                      Этот поддомен недоступен для выбора. Выберите доступный
                      поддомен из списка ниже:
                    </span>
                  </div>

                  <div className="space-y-1">
                    {domainSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-700 hover:bg-gray-50 cursor-pointer py-1 px-2 rounded"
                        onClick={() => {
                          setDomain(suggestion);
                          setShowDomainSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}

            <Button
              variant="primary"
              className="w-full"
              isLink
              to=""
              onClick={(event) => register(event)}
              disabled={isLoading}
            >
              {isLoading ? "Создание профиля..." : "Создать профиль"}
            </Button>

            <Link
              to=""
              className="block text-center text-base-chart-1 font-medium hover:underline mx-auto"
            >
              Обратиться в техподдержку
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
