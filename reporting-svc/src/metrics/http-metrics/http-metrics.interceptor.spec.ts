import { HttpMetricsInterceptor } from "./http-metrics.interceptor";

describe("HttpMetricsInterceptor", () => {
	it("should be defined", () => {
		expect(new HttpMetricsInterceptor()).toBeDefined();
	});
});
