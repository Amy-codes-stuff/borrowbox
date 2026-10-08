import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ItemCard from './ItemCard';

describe('ItemCard', () => {
  it('shows item details and links to that item', () => {
    const item = {
      _id: 'item-123',
      name: 'Scientific Calculator',
      category: 'Study',
      condition: 'Good',
      description: 'A working calculator for coursework.',
      location: 'North Hall',
      status: 'available',
      owner: { name: 'Alex Johnson' },
    };

    render(
      <MemoryRouter>
        <ItemCard item={item} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: item.name })).toBeTruthy();
    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText(item.location)).toBeTruthy();
    expect(screen.getByRole('link', { name: /view details/i }).getAttribute('href'))
      .toBe(`/items/${item._id}`);
  });
});