import { Alert, Platform } from 'react-native';

/**
 * Universal confirmation dialog that works seamlessly across iOS, Android, and Web.
 * On Web: uses window.confirm.
 * On Mobile: uses React Native Alert.alert with cancel/confirm buttons.
 */
export const confirmDialog = ({
  title = 'Confirmation',
  message = '',
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
  isDestructive = false,
}) => {
  if (Platform.OS === 'web') {
    const promptText = message ? `${title}\n\n${message}` : title;
    const confirmed = typeof window !== 'undefined' ? window.confirm(promptText) : true;
    if (confirmed) {
      if (onConfirm) onConfirm();
    } else {
      if (onCancel) onCancel();
    }
  } else {
    Alert.alert(title, message, [
      {
        text: cancelText,
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: confirmText,
        style: isDestructive ? 'destructive' : 'default',
        onPress: onConfirm,
      },
    ]);
  }
};

/**
 * Universal notice/alert dialog that works on Web and Mobile.
 * On Web: uses window.alert, then executes callback.
 * On Mobile: uses React Native Alert.alert.
 */
export const showNotice = ({ title = 'Notice', message = '', onOk }) => {
  if (Platform.OS === 'web') {
    const promptText = message ? `${title}\n\n${message}` : title;
    if (typeof window !== 'undefined') {
      window.alert(promptText);
    }
    if (onOk) onOk();
  } else {
    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: onOk,
      },
    ]);
  }
};

export default { confirmDialog, showNotice };
