import { waitFor } from 'storybook/test';
import AddPatientModal from './AddPatientModal';
import client from '../../../api/client';

export default {
  title: 'Organisms/AddPatientModal',
  component: AddPatientModal,
};

export const Open = {
  args: { isOpen: true, onClose: () => {}, doctorId: '1' },
};

export const Closed = {
  args: { isOpen: false, onClose: () => {}, doctorId: '1' },
};

function fillRequiredFields(canvasElement) {
  const set = (name, value) => {
    const input = canvasElement.querySelector(`input[name="${name}"]`);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  set('name', 'John Smith');
  set('dob', '1990-01-01');
}

export const LoadingState = {
  args: { isOpen: true, onClose: () => {}, doctorId: '1' },
  play: async ({ canvasElement }) => {
    const originalPost = client.post;
    try {
      client.post = () => new Promise(() => {});
      fillRequiredFields(canvasElement);
      canvasElement.querySelector('button[type="submit"]').click();

      await waitFor(() => {
        const button = canvasElement.querySelector('button[type="submit"]');
        if (button.textContent !== 'Saving...') throw new Error('not loading yet');
      });
    } finally {
      client.post = originalPost;
    }
  },
};

export const ErrorState = {
  args: { isOpen: true, onClose: () => {}, doctorId: '1' },
  play: async ({ canvasElement }) => {
    const originalPost = client.post;
    try {
      client.post = async () => {
        throw { response: { data: { error: 'Email already registered.' } } };
      };
      fillRequiredFields(canvasElement);
      canvasElement.querySelector('button[type="submit"]').click();

      await waitFor(() => {
        if (!canvasElement.textContent.includes('Email already registered')) {
          throw new Error('error banner not shown yet');
        }
      });
    } finally {
      client.post = originalPost;
    }
  },
};