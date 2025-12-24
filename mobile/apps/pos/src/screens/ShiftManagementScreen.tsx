
import React, { useState } from 'react';
import {
    View, Text, Pressable, ScrollView, StyleSheet, SafeAreaView,
    StatusBar, TextInput, Alert, Modal
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { posActions, CashTransaction } from '../store/posSlice';
import type { PosState } from '../store/posSlice';
import Ionicons from '@expo/vector-icons/Ionicons';

export function ShiftManagementScreen() {
    const dispatch = useDispatch();
    const { shift } = useSelector<{ pos: PosState }, PosState>(s => s.pos);

    const [startingCash, setStartingCash] = useState('');
    const [actualCash, setActualCash] = useState('');
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState('');
    const [transactionReason, setTransactionReason] = useState('');
    const [transactionType, setTransactionType] = useState<'IN' | 'OUT'>('OUT');

    const handleStartShift = () => {
        const amount = parseFloat(startingCash);
        if (isNaN(amount) || amount < 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid starting cash amount.');
            return;
        }
        dispatch(posActions.shiftOpened(amount));
        setStartingCash('');
    };

    const handleCloseShift = () => {
        if (!actualCash) {
            Alert.alert('Enter Cash Amount', 'Please count the money in the till and enter the amount.');
            return;
        }
        const amount = parseFloat(actualCash);
        if (isNaN(amount) || amount < 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid cash amount.');
            return;
        }

        const variance = amount - (shift?.expectedCash || 0);

        Alert.alert(
            'Confirm Close Shift',
            `Expected: $${shift?.expectedCash.toFixed(2)}\nActual: $${amount.toFixed(2)}\nVariance: ${variance >= 0 ? '+' : ''}$${variance.toFixed(2)}\n\nAre you sure?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close Shift',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(posActions.shiftClosed(amount));
                        setActualCash('');
                    }
                }
            ]
        );
    };

    const handleAddTransaction = () => {
        const amount = parseFloat(transactionAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount.');
            return;
        }
        if (!transactionReason.trim()) {
            Alert.alert('Reason Required', 'Please enter a reason for this transaction.');
            return;
        }

        const transaction: CashTransaction = {
            timestamp: new Date().toISOString(),
            amount: amount,
            reason: transactionReason,
            type: transactionType
        };

        dispatch(posActions.cashTransactionAdded(transaction));
        setShowTransactionModal(false);
        setTransactionAmount('');
        setTransactionReason('');
    };

    if (!shift || shift.status === 'CLOSED') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContent}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="wallet-outline" size={64} color="#0d6efd" />
                    </View>
                    <Text style={styles.title}>Start New Shift</Text>
                    <Text style={styles.subtitle}>Enter the starting cash amount in the till</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.currencyPrefix}>$</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={startingCash}
                            onChangeText={setStartingCash}
                            autoFocus
                        />
                    </View>

                    <Pressable style={styles.primaryButton} onPress={handleStartShift}>
                        <Text style={styles.buttonText}>Open Shift</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Shift Management</Text>
                    <View style={styles.statusBadge}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>OPEN</Text>
                    </View>
                </View>

                <View style={styles.statsCard}>
                    <View style={styles.statRow}>
                        <View>
                            <Text style={styles.statLabel}>Expected Cash</Text>
                            <Text style={styles.statValue}>${shift.expectedCash.toFixed(2)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.statLabel}>Starting Cash</Text>
                            <Text style={styles.statSubValue}>${shift.startingCash.toFixed(2)}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.quickActions}>
                        <Pressable
                            style={[styles.actionBtn, styles.payInBtn]}
                            onPress={() => {
                                setTransactionType('IN');
                                setShowTransactionModal(true);
                            }}
                        >
                            <Ionicons name="arrow-down-circle-outline" size={20} color="#198754" />
                            <Text style={styles.actionBtnText}>Pay In</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.actionBtn, styles.payOutBtn]}
                            onPress={() => {
                                setTransactionType('OUT');
                                setShowTransactionModal(true);
                            }}
                        >
                            <Ionicons name="arrow-up-circle-outline" size={20} color="#dc3545" />
                            <Text style={styles.actionBtnText}>Pay Out</Text>
                        </Pressable>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Transactions</Text>
                {shift.cashTransactions.length === 0 ? (
                    <Text style={styles.emptyText}>No cash transactions yet.</Text>
                ) : (
                    shift.cashTransactions.map((tx, idx) => (
                        <View key={idx} style={styles.transactionItem}>
                            <View style={styles.txIcon}>
                                <Ionicons
                                    name={tx.type === 'IN' ? 'add-circle-outline' : 'remove-circle-outline'}
                                    size={24}
                                    color={tx.type === 'IN' ? '#198754' : '#dc3545'}
                                />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={styles.txReason}>{tx.reason}</Text>
                                <Text style={styles.txTime}>{new Date(tx.timestamp).toLocaleTimeString()}</Text>
                            </View>
                            <Text style={[styles.txAmount, { color: tx.type === 'IN' ? '#198754' : '#dc3545' }]}>
                                {tx.type === 'IN' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </Text>
                        </View>
                    ))
                )}

                <View style={styles.closeSection}>
                    <Text style={styles.sectionTitle}>Close Shift</Text>
                    <Text style={styles.subtitle}>Count the cash drawer and enter amount below</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.currencyPrefix}>$</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={actualCash}
                            onChangeText={setActualCash}
                        />
                    </View>

                    <Pressable style={styles.closeButton} onPress={handleCloseShift}>
                        <Text style={styles.closeButtonText}>Close Shift & Reconcile</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Transaction Modal */}
            <Modal visible={showTransactionModal} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{transactionType === 'IN' ? 'Pay In' : 'Pay Out'}</Text>
                            <Pressable onPress={() => setShowTransactionModal(false)}>
                                <Ionicons name="close" size={24} color="#6c757d" />
                            </Pressable>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={styles.label}>Amount</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="0.00"
                                keyboardType="decimal-pad"
                                value={transactionAmount}
                                onChangeText={setTransactionAmount}
                                autoFocus
                            />

                            <Text style={styles.label}>Reason</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder={transactionType === 'IN' ? 'e.g., Added change' : 'e.g., Supplier payment'}
                                value={transactionReason}
                                onChangeText={setTransactionReason}
                            />

                            <Pressable style={styles.primaryButton} onPress={handleAddTransaction}>
                                <Text style={styles.buttonText}>Confirm</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa'
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    scrollContent: {
        padding: 16
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e7f5ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 24
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        paddingHorizontal: 16,
        marginBottom: 24,
        width: '100%',
        maxWidth: 300
    },
    currencyPrefix: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212529',
        marginRight: 8
    },
    input: {
        flex: 1,
        fontSize: 24,
        paddingVertical: 12,
        color: '#212529',
        fontWeight: '600'
    },
    primaryButton: {
        backgroundColor: '#0d6efd',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        maxWidth: 300,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#212529'
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#d1e7dd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#198754',
        marginRight: 6
    },
    statusText: {
        color: '#198754',
        fontWeight: '700',
        fontSize: 14
    },
    statsCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e9ecef',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    statLabel: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 4
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#212529'
    },
    statSubValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#212529'
    },
    divider: {
        height: 1,
        backgroundColor: '#e9ecef',
        marginBottom: 16
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1
    },
    payInBtn: {
        backgroundColor: '#f8f9fa',
        borderColor: '#198754'
    },
    payOutBtn: {
        backgroundColor: '#f8f9fa',
        borderColor: '#dc3545'
    },
    actionBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
        marginLeft: 8
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 12
    },
    emptyText: {
        color: '#6c757d',
        fontStyle: 'italic',
        marginBottom: 24
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    txIcon: {
        marginRight: 12
    },
    txInfo: {
        flex: 1
    },
    txReason: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529'
    },
    txTime: {
        fontSize: 12,
        color: '#6c757d'
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '700'
    },
    closeSection: {
        marginTop: 24,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    closeButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 8
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700'
    },
    modalBody: {
        gap: 16
    },
    modalInput: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 8,
        padding: 12,
        fontSize: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#212529',
        marginBottom: -8
    }
});
