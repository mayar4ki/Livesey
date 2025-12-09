import * as yup from 'yup';

export const createProposalFormSchema = yup
  .object()
  .shape({
    title: yup.string().required().min(3).max(200).label('Proposal Title'),
    description: yup.string().required().min(10).max(5000).label('Description'),
    durationDays: yup.number().required().min(0).max(365).integer().label('Days'),
    durationHours: yup.number().required().min(0).max(23).integer().label('Hours'),
    durationMinutes: yup.number().required().min(0).max(59).integer().label('Minutes'),
  })
  .test('duration-validation', 'Duration must be at least 1 minute', function (value) {
    const { durationDays = 0, durationHours = 0, durationMinutes = 0 } = value || {};
    const totalMinutes = durationDays * 24 * 60 + durationHours * 60 + durationMinutes;
    if (totalMinutes < 1) {
      return this.createError({
        message: 'Duration must be at least 1 minute',
        path: 'durationMinutes',
      });
    }
    return true;
  });

export type CreateProposalFormSchema = yup.InferType<typeof createProposalFormSchema>;
