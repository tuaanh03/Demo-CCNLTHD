import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';
import { BookingRequest } from '../types';

interface BookingFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: BookingRequest) => void;
    showTimeId: string;
    seatShowTimeIds: string[];
    defaultUserId?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
    open,
    onClose,
    onSubmit,
    showTimeId,
    seatShowTimeIds,
    defaultUserId,
}) => {
    const [formData, setFormData] = React.useState<Pick<BookingRequest, 'userId'>>({
        userId: defaultUserId || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            showTimeId,
            seatShowTimeIds,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Nhập Thông Tin Của Bạn</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            required
                            fullWidth
                            label="Mã người dùng"
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="submit" variant="contained" color="primary">
                        Xác Nhận Đặt Vé
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}; 