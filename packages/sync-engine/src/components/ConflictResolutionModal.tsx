import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

interface Conflict {
  id: string;
  localEvent: any;
  serverEvent: any;
  entityType: string;
  entityId: string;
  timestamp: Date;
}

interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: Conflict[];
  onResolve: (conflictId: string, resolution: 'local' | 'server' | 'merge') => void;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  conflicts,
  onResolve,
  onClose,
}) => {
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, 'local' | 'server' | 'merge'>>({});

  const handleResolveAll = () => {
    Object.entries(selectedResolutions).forEach(([conflictId, resolution]) => {
      onResolve(conflictId, resolution);
    });
    setSelectedResolutions({});
    onClose();
  };

  const canResolveAll = conflicts.length > 0 && conflicts.every(conflict => selectedResolutions[conflict.id]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Resolve Sync Conflicts</Text>
          <Text style={styles.subtitle}>
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} need{conflicts.length === 1 ? 's' : ''} your attention
          </Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {conflicts.map((conflict) => (
            <Card key={conflict.id} style={styles.conflictCard}>
              <View style={styles.conflictHeader}>
                <Badge variant="warning">
                  <Text style={styles.entityType}>{conflict.entityType}</Text>
                </Badge>
                <Text style={styles.entityId}>ID: {conflict.entityId}</Text>
                <Text style={styles.timestamp}>
                  {conflict.timestamp.toLocaleString()}
                </Text>
              </View>

              <View style={styles.conflictContent}>
                <View style={styles.versionContainer}>
                  <Text style={styles.versionLabel}>Your Local Version</Text>
                  <View style={styles.versionData}>
                    <Text style={styles.versionText}>
                      {JSON.stringify(conflict.localEvent, null, 2)}
                    </Text>
                  </View>
                </View>

                <View style={styles.versionContainer}>
                  <Text style={styles.versionLabel}>Server Version</Text>
                  <View style={styles.versionData}>
                    <Text style={styles.versionText}>
                      {JSON.stringify(conflict.serverEvent, null, 2)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.resolutionOptions}>
                <Text style={styles.resolutionLabel}>Choose Resolution:</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.resolutionButton,
                      selectedResolutions[conflict.id] === 'local' && styles.selectedButton
                    ]}
                    onPress={() => setSelectedResolutions(prev => ({ ...prev, [conflict.id]: 'local' }))}
                  >
                    <Text style={styles.buttonText}>Use Local</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resolutionButton,
                      selectedResolutions[conflict.id] === 'server' && styles.selectedButton
                    ]}
                    onPress={() => setSelectedResolutions(prev => ({ ...prev, [conflict.id]: 'server' }))}
                  >
                    <Text style={styles.buttonText}>Use Server</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.resolutionButton,
                      selectedResolutions[conflict.id] === 'merge' && styles.selectedButton
                    ]}
                    onPress={() => setSelectedResolutions(prev => ({ ...prev, [conflict.id]: 'merge' }))}
                  >
                    <Text style={styles.buttonText}>Merge</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            variant="outline"
            onPress={onClose}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleResolveAll}
            disabled={!canResolveAll}
            style={styles.resolveButton}
          >
            Resolve All ({Object.keys(selectedResolutions).length}/{conflicts.length})
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  conflictCard: {
    marginBottom: 20,
    padding: 16,
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  entityType: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  entityId: {
    fontSize: 14,
    color: '#6c757d',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
  conflictContent: {
    marginBottom: 16,
  },
  versionContainer: {
    marginBottom: 12,
  },
  versionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  versionData: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#495057',
  },
  resolutionOptions: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 16,
  },
  resolutionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resolutionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  selectedButtonText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
  },
  resolveButton: {
    flex: 2,
  },
});