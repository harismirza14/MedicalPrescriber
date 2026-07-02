import { waitFor, expect, fn } from 'storybook/test';
import AddDoctorModal from './AddDoctorModal';
import client from '../../../api/client';

export default {
  title: 'Organisms/AddDoctorModal',
  component: AddDoctorModal,
  args: {
    onClose: () => {},
    onDoctorAdded: () => {},
  },
};

export const Open = {
  args: { isOpen: true },
};

export const Closed = {
  args: { isOpen: false },
};

function fillRequiredFields(canvasElement) {
  const set = (name, value) => {
    const input = canvasElement.querySelector(`input[name="${name}"]`);
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  set('name', 'Dr. Jane Doe');
  set('email', 'jane.doe@example.com');
  set('phone_number', '0300-1234567');
}

export const LoadingState = {
  args: { isOpen: true },
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

export const SuccessState = {
  args: {
    isOpen: true,
    onDoctorAdded: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const originalPost = client.post;
    const onDoctorAddedMock = args.onDoctorAdded; 

    try {
      client.post = async () => ({ data: {} });
      fillRequiredFields(canvasElement);
      canvasElement.querySelector('button[type="submit"]').click();
      await waitFor(() => {
        expect(onDoctorAddedMock).toHaveBeenCalled();
      });
    } finally {
      client.post = originalPost;
    }
  },
};

export const ErrorState = {
  args: { isOpen: true },
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