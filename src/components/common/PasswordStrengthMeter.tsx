import React from 'react';

interface PasswordStrengthMeterProps {
    password: string;
    email?: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password, email }) => {
    const calculateStrength = (): { score: number; feedback: string[] } => {
        const feedback: string[] = [];
        let score = 0;

        // Length check
        if (password.length >= 12) {
            score += 20;
        } else {
            feedback.push('At least 12 characters long');
        }

        // Number check
        if (/\d/.test(password)) {
            score += 20;
        } else {
            feedback.push('At least 1 number');
        }

        // Lowercase check
        if (/[a-z]/.test(password)) {
            score += 20;
        } else {
            feedback.push('At least 1 lowercase letter');
        }

        // Uppercase check
        if (/[A-Z]/.test(password)) {
            score += 20;
        } else {
            feedback.push('At least 1 uppercase letter');
        }

        // Special character check
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score += 20;
        } else {
            feedback.push('At least 1 special character');
        }

        // Email check
        if (email && password.toLowerCase().includes(email.toLowerCase())) {
            score -= 20;
            feedback.push('Password should not contain your email');
        }

        return { score, feedback };
    };

    const { score, feedback } = calculateStrength();

    const getStrengthLabel = (score: number): string => {
        if (score <= 20) return 'Very Weak';
        if (score <= 40) return 'Weak';
        if (score <= 60) return 'Fair';
        if (score <= 80) return 'Strong';
        return 'Very Strong';
    };

    const getStrengthColor = (score: number): string => {
        if (score <= 20) return 'bg-red-500';
        if (score <= 40) return 'bg-orange-500';
        if (score <= 60) return 'bg-yellow-500';
        if (score <= 80) return 'bg-blue-500';
        return 'bg-green-500';
    };

    return (
        <div className="mt-2">
            {/* Strength Meter Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${getStrengthColor(score)}`}
                    style={{ width: `${score}%` }}
                />
            </div>

            {/* Strength Label */}
            <div className="mt-1 flex justify-between items-center text-sm">
                <span className="text-gray-600">
                    Password Strength: <span className="font-medium">{getStrengthLabel(score)}</span>
                </span>
                <span className="text-gray-600">{score}%</span>
            </div>

            {/* Requirements List */}
            {feedback.length > 0 && (
                <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 font-medium">Password requirements:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {feedback.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {score === 100 && (
                <p className="mt-2 text-sm text-green-600">
                    ✓ Password meets all requirements
                </p>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;