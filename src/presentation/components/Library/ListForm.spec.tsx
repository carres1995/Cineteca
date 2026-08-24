// src/presentation/components/Library/ListForm.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Library } from '@/domain/library/library';
import { EMPTY_LIBRARY } from '@/domain/library/library';
import { ListForm } from './ListForm';

const withList: Library = {
  entries: [],
  lists: [{ id: 'l1', name: 'Clásicos', movieIds: [], createdAt: '2026-08-24T10:00:00.000Z' }],
};

function renderForm(library: Library = EMPTY_LIBRARY, isPending = false) {
  const onSubmit = vi.fn();

  render(
    <ListForm
      library={library}
      submitLabel="Crear lista"
      pendingLabel="Creando…"
      isPending={isPending}
      onSubmit={onSubmit}
    />,
  );

  return { onSubmit };
}

describe('ListForm: cada motivo de bloqueo con su propio mensaje', () => {
  it('sin nombre lo dice, y lo anuncia', async () => {
    const { onSubmit } = renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Crear lista' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Poné un nombre a la lista.');
    expect(screen.getByLabelText('Nombre de la lista')).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('un nombre repetido tiene su propio motivo, no un "no se puede" genérico', async () => {
    const { onSubmit } = renderForm(withList);

    await userEvent.type(screen.getByLabelText('Nombre de la lista'), 'clásicos');
    await userEvent.click(screen.getByRole('button', { name: 'Crear lista' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya tenés una lista con ese nombre.',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('un nombre demasiado largo también tiene el suyo', async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(screen.getByLabelText('Nombre de la lista'), 'a'.repeat(41));
    await userEvent.click(screen.getByRole('button', { name: 'Crear lista' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/40 caracteres/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('el error apunta al campo con aria-describedby', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Crear lista' }));

    const input = screen.getByLabelText('Nombre de la lista');
    const alert = await screen.findByRole('alert');

    expect(input).toHaveAttribute('aria-describedby', alert.id);
  });

  it('con un nombre válido entrega el valor y limpia el campo', async () => {
    const { onSubmit } = renderForm();

    await userEvent.type(screen.getByLabelText('Nombre de la lista'), 'Cine negro');
    await userEvent.click(screen.getByRole('button', { name: 'Crear lista' }));

    expect(onSubmit).toHaveBeenCalledWith({ name: 'Cine negro' });
  });

  it('mientras vuela, el envío está bloqueado: dos clics no crean dos listas', () => {
    renderForm(EMPTY_LIBRARY, true);

    expect(screen.getByRole('button', { name: 'Creando…' })).toBeDisabled();
  });
});
