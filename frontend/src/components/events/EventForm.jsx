import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { FormField } from '../common/FormField';

function dateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

const emptyForm = { name: '', description: '', date: '', time: '', venue: '', capacity: '' };

export function EventForm({ initialEvent, onSubmit, loading = false, submitLabel = 'Create event' }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialEvent) {
      setForm({
        name: initialEvent.name || '',
        description: initialEvent.description || '',
        date: dateInputValue(initialEvent.date),
        time: initialEvent.time || '',
        venue: initialEvent.venue || '',
        capacity: String(initialEvent.capacity ?? ''),
      });
    }
  }, [initialEvent]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim() || form.name.trim().length < 2) next.name = 'Enter an event name.';
    if (form.description.trim().length < 10) next.description = 'Add at least 10 characters.';
    if (!form.date) next.date = 'Choose an event date.';
    if (!form.time) next.time = 'Choose an event time.';
    if (!form.venue.trim()) next.venue = 'Enter a venue.';
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) next.capacity = 'Capacity must be a whole number between 1 and 100,000.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
    });
  }

  return (
    <form className="event-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid form-grid-2">
        <FormField label="Event name" name="name" error={errors.name} className="field-span-2">
          <input id="name" name="name" value={form.name} onChange={updateField} placeholder="e.g. Northstar Design Summit" required />
        </FormField>
        <FormField label="Event date" name="date" error={errors.date}>
          <input id="date" name="date" type="date" value={form.date} onChange={updateField} required />
        </FormField>
        <FormField label="Start time" name="time" error={errors.time} hint="24-hour time">
          <input id="time" name="time" type="time" value={form.time} onChange={updateField} required />
        </FormField>
        <FormField label="Venue" name="venue" error={errors.venue} className="field-span-2">
          <input id="venue" name="venue" value={form.venue} onChange={updateField} placeholder="Building, room, or address" required />
        </FormField>
        <FormField label="Capacity" name="capacity" error={errors.capacity} hint="Maximum number of attendees">
          <input id="capacity" name="capacity" type="number" min="1" max="100000" step="1" value={form.capacity} onChange={updateField} required />
        </FormField>
      </div>
      <FormField label="Description" name="description" error={errors.description} className="field-span-2">
        <textarea id="description" name="description" rows="6" value={form.description} onChange={updateField} placeholder="Tell attendees what they can expect…" required />
      </FormField>
      <div className="form-actions">
        <Button type="submit" loading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
