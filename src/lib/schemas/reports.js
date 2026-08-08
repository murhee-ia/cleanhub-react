import { z } from 'zod'

export const REPORT_REASON_MAX = 2000

export const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Please describe the problem in a little more detail')
    .max(REPORT_REASON_MAX, `Reason must be ${REPORT_REASON_MAX} characters or fewer`),
})

// The moderator's optional closing note, shared by resolve/reject/escalate/
// hide/warn.
export const handleReportSchema = z.object({
  note: z
    .string()
    .max(REPORT_REASON_MAX, `Note must be ${REPORT_REASON_MAX} characters or fewer`)
    .optional(),
})
