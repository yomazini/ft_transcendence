"use client";

import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type OtpInputProps = {
	value: string;
	onChange: (value: string) => void;
	length?: number;
	disabled?: boolean;
	autoFocus?: boolean;
	id?: string;
};

export function OtpInput({ value, onChange, length = 6, disabled, autoFocus, id }: OtpInputProps) {
	const refs = useRef<(HTMLInputElement | null)[]>([]);
	const digits = Array.from({ length }, (_, i) => value[i] ?? "");

	useEffect(() => {
		if (autoFocus && !disabled && value === "") {
			refs.current[0]?.focus();
		}
	}, [autoFocus, disabled, value]);

	function focus(index: number) {
		const target = refs.current[Math.max(0, Math.min(index, length - 1))];
		target?.focus();
		target?.select();
	}

	function setDigits(next: string[]) {
		onChange(next.join("").slice(0, length));
	}

	function handleInput(index: number, raw: string) {
		const typed = raw.replace(/\D/g, "");
		if (!typed) return;
		if (typed.length > 1) {
			const next = [...digits];
			typed.split("").forEach((d, k) => {
				if (index + k < length) next[index + k] = d;
			});
			setDigits(next);
			focus(index + typed.length);
			return;
		}
		const next = [...digits];
		next[index] = typed;
		setDigits(next);
		focus(index + 1);
	}

	function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Backspace") {
			e.preventDefault();
			const next = [...digits];
			if (next[index]) {
				next[index] = "";
				setDigits(next);
			} else if (index > 0) {
				next[index - 1] = "";
				setDigits(next);
				focus(index - 1);
			}
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			focus(index - 1);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			focus(index + 1);
		}
	}

	function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
		if (!pasted) return;
		e.preventDefault();
		onChange(pasted);
		focus(pasted.length);
	}

	return (
		<div className="flex items-center justify-center gap-2" role="group" aria-label="6-digit code">
			{digits.map((digit, i) => (
				<div key={i} className="flex items-center gap-2">
					{i === length / 2 && <span className="h-0.5 w-3 rounded bg-zinc-300 dark:bg-white/20" aria-hidden />}
					<input
						ref={(el) => {
							refs.current[i] = el;
						}}
						id={i === 0 ? id : undefined}
						type="text"
						inputMode="numeric"
						autoComplete={i === 0 ? "one-time-code" : "off"}
						maxLength={length}
						aria-label={`Digit ${i + 1}`}
						value={digit}
						disabled={disabled}
						autoFocus={autoFocus && i === 0}
						onChange={(e) => handleInput(i, e.target.value)}
						onKeyDown={(e) => handleKeyDown(i, e)}
						onPaste={handlePaste}
						onFocus={(e) => e.target.select()}
						className="h-12 w-10 rounded-xl border border-zinc-200 bg-zinc-50/50 text-center text-xl font-semibold text-zinc-900 caret-violet-600 outline-none transition-colors focus-visible:border-violet-500 focus-visible:ring-3 focus-visible:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-11 dark:border-white/10 dark:bg-zinc-800/50 dark:text-white"
					/>
				</div>
			))}
		</div>
	);
}
