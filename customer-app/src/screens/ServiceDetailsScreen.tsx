import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';
import { TopAppBar } from '../components/navigation/TopAppBar';
import { Button } from '../components/buttons/Button';
import { PriceBadge } from '../components/badges/PriceBadge';
import { MaterialIcons } from '@expo/vector-icons';
import { getServiceRatingSummary, getServiceReviews, ServiceRatingSummary, ReviewResponse } from '../api/ReviewService';

type Props = NativeStackScreenProps<RootStackParamList, 'ServiceDetails'>;

export default function ServiceDetailsScreen({ route, navigation }: Props) {
  const { service } = route.params;
  const { addToCart } = useCart();

  const [summary, setSummary] = useState<ServiceRatingSummary | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);

  useEffect(() => {
    const loadReviewsData = async () => {
      try {
        setLoadingReviews(true);
        const [sumData, revData] = await Promise.all([
          getServiceRatingSummary(service.id),
          getServiceReviews(service.id),
        ]);
        setSummary(sumData);
        setReviews(revData);
      } catch (e) {
        console.log('Error loading reviews:', e);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviewsData();
  }, [service.id]);

  const handleAddToCart = () => {
    addToCart(service);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <TopAppBar 
        title="Details" 
        onBackPress={() => navigation.goBack()} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {service.imageUrl ? (
          <Image source={{ uri: service.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="image" size={48} color={theme.colors.border} />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{service.name}</Text>
          
          <View style={styles.metaRow}>
            <PriceBadge price={service.price} />
            <View style={styles.durationBadge}>
              <MaterialIcons name="schedule" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.durationText}>{service.duration} mins</Text>
            </View>
          </View>

          {summary && summary.reviewCount > 0 && (
            <View style={styles.ratingBox}>
              <MaterialIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.avgRatingText}>{summary.averageRating.toFixed(1)}</Text>
              <Text style={styles.reviewCountText}>({summary.reviewCount} {summary.reviewCount === 1 ? 'review' : 'reviews'})</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{service.description}</Text>

          {service.inclusions && service.inclusions.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>What's Included</Text>
              {service.inclusions.map((item: string, index: number) => (
                <View key={index} style={styles.inclusionRow}>
                  <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.inclusionText}>{item}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>Customer Reviews</Text>
          {loadingReviews ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 10 }} />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>No reviews yet for this service.</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{rev.customerName || 'Customer'}</Text>
                  <View style={styles.starRowInline}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <MaterialIcons
                        key={s}
                        name={s <= rev.rating ? 'star' : 'star-border'}
                        size={14}
                        color="#FFD700"
                      />
                    ))}
                  </View>
                </View>
                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Add to Cart" 
          onPress={handleAddToCart}
          leftIcon={<MaterialIcons name="add-shopping-cart" size={20} color={theme.colors.background} />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  durationText: {
    marginLeft: 4,
    fontSize: theme.typography.bodySmall.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  inclusionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  inclusionText: {
    marginLeft: theme.spacing.sm,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  avgRatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: 4,
  },
  reviewCountText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
  },
  noReviewsText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginVertical: 6,
  },
  reviewCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  starRowInline: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
});
