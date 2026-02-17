import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1px solid #e5e5e5',
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#ff9a8b',
  },
  meta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  metaItem: {
    fontSize: 10,
    marginBottom: 4,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '1px solid #f0f0f0',
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottom: '1px solid #e5e5e5',
    paddingVertical: 8,
    backgroundColor: '#f9fafb',
  },
  col1: { width: '40%', fontSize: 10 },
  col2: { width: '20%', fontSize: 10, textAlign: 'right' },
  col3: { width: '20%', fontSize: 10, textAlign: 'right' },
  col4: { width: '20%', fontSize: 10, textAlign: 'right' },
  headerCol: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase',
  },
  totalSection: {
    marginTop: 20,
    alignItems: 'flex-end',
    borderTop: '1px solid #e5e5e5',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
    width: '100%',
  },
  totalLabel: {
    fontSize: 10,
    color: '#666',
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 80,
    textAlign: 'right',
  },
});

export function InvoicePdfDocument({ data }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const clinicName = String(data.clinicName || '').trim() || 'Clinic';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={{ fontSize: 10, marginTop: 4, color: '#666' }}>#{data.invoiceNumber}</Text>
          </View>
          <View style={styles.meta}>
            <Text style={[styles.metaItem, { fontWeight: 'bold', fontSize: 12, color: '#000' }]}>{clinicName}</Text>
            <Text style={styles.metaItem}>Date: {data.date}</Text>
            <Text style={styles.metaItem}>Status: {data.status || 'pending'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{data.patientName || 'Patient'}</Text>
          <Text style={{ fontSize: 10, marginTop: 4, color: '#666' }}>{data.patientContact || ''}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={[styles.col1, styles.headerCol, { paddingLeft: 8 }]}>Item</Text>
            <Text style={[styles.col2, styles.headerCol]}>Rate</Text>
            <Text style={[styles.col3, styles.headerCol]}>Qty</Text>
            <Text style={[styles.col4, styles.headerCol, { paddingRight: 8 }]}>Amount</Text>
          </View>
          {items.map((item, index) => (
            <View key={`${item.name}-${index}`} style={styles.row}>
              <Text style={[styles.col1, { paddingLeft: 8 }]}>{item.name}</Text>
              <Text style={styles.col2}>Rs {Number(item.price || 0).toFixed(2)}</Text>
              <Text style={styles.col3}>{Number(item.quantity || 0)}</Text>
              <Text style={[styles.col4, { paddingRight: 8 }]}>Rs {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>Rs {Number(data.subtotal || 0).toFixed(2)}</Text></View>
          {Number(data.discount || 0) > 0 && <View style={styles.totalRow}><Text style={styles.totalLabel}>Discount</Text><Text style={[styles.totalValue, { color: '#ff6b6b' }]}>- Rs {Number(data.discount || 0).toFixed(2)}</Text></View>}
          {Number(data.tax || 0) > 0 && <View style={styles.totalRow}><Text style={styles.totalLabel}>Tax</Text><Text style={styles.totalValue}>+ Rs {Number(data.tax || 0).toFixed(2)}</Text></View>}
          <View style={[styles.totalRow, { marginTop: 8, borderTop: '1px solid #000', paddingTop: 8 }]}> 
            <Text style={[styles.totalLabel, { fontSize: 12, fontWeight: 'bold', color: '#000' }]}>Total</Text>
            <Text style={[styles.totalValue, { fontSize: 12, color: '#ff9a8b' }]}>Rs {Number(data.total || 0).toFixed(2)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
