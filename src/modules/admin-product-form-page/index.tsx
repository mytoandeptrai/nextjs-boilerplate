'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import {
  type ProductBody,
  type ProductFormInput,
  productSchema,
  useAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
} from '@/api/admin-products';
import { useCategoriesQuery } from '@/api/catalog/queries';
import { FieldError } from '@/components/admin/field-error';
import { ImageUpload } from '@/components/admin/image-upload';
import { AdminPageHeader } from '@/components/admin/page-header';
import { QueryState } from '@/components/admin/query-state';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { HttpStatus } from '@/enums/enum';
import { useTranslations } from '@/hooks';
import { Link, useRouter } from '@/i18n/navigation';
import { slugify } from '@/lib/format';
import type { IProduct } from '@/types/catalog';
import { OptionList } from './option-list';

const NO_CATEGORY = 'none';

const EMPTY: ProductFormInput = {
  title: '',
  slug: '',
  category_id: null,
  description: '',
  base_price: '',
  pricing_type: 'linear_meter',
  pleat_options: [],
  fabric_options: [],
  motor_options: [],
  images: [],
  is_active: true,
};

const toFormValues = (product: IProduct): ProductFormInput => ({
  title: product.title,
  slug: product.slug,
  category_id: product.category_id,
  description: product.description,
  base_price: product.base_price,
  pricing_type: product.pricing_type,
  pleat_options: product.pleat_options,
  fabric_options: product.fabric_options,
  motor_options: product.motor_options,
  images: product.images,
  is_active: product.is_active,
});

function ProductForm({ product }: { product?: IProduct }) {
  const { t } = useTranslations('admin');
  const router = useRouter();
  const { data: categories = [] } = useCategoriesQuery();
  const { mutate: create, isPending: isCreating } = useCreateAdminProductMutation();
  const { mutate: update, isPending: isUpdating } = useUpdateAdminProductMutation();
  const isPending = isCreating || isUpdating;

  const form = useForm<ProductFormInput, unknown, ProductBody>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? toFormValues(product) : EMPTY,
  });
  const pricingType = useWatch({ control: form.control, name: 'pricing_type' });
  const slug = useWatch({ control: form.control, name: 'slug' });
  const { errors, dirtyFields } = form.formState;

  const _handleSubmit = (body: ProductBody) => {
    const options = {
      onSuccess: () => {
        toast.success(t('common.saved'));
        router.push(ROUTES.ADMIN_PRODUCTS);
      },
      onError: (error: { status: number }) => {
        if (error.status === HttpStatus.CONFLICT)
          return form.setError('slug', { type: 'taken' }, { shouldFocus: true });

        toast.error(t('common.saveError'));
      },
    };

    if (product) update({ id: product.id, body }, options);
    else create(body, options);
  };

  return (
    <Form {...form}>
      <form noValidate onSubmit={form.handleSubmit(_handleSubmit)} className='grid gap-6 xl:grid-cols-[1fr_360px]'>
        <div className='min-w-0 space-y-6'>
          <section className='bg-card space-y-4 border p-4 lg:p-6'>
            <h2 className='font-medium'>{t('products.form.basics')}</h2>
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.form.title')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        // Follow the title until the slug is edited by hand (new products only).
                        if (!product && !dirtyFields.slug) form.setValue('slug', slugify(event.target.value));
                      }}
                    />
                  </FormControl>
                  <FieldError />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.form.slug')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>{t('products.form.slugHint', { slug: slug || '...' })}</FormDescription>
                  <FieldError messageKey='slugInvalid' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='category_id'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.form.category')}</FormLabel>
                  <Select
                    value={field.value ?? NO_CATEGORY}
                    onValueChange={(value) => field.onChange(value === NO_CATEGORY ? null : value)}
                  >
                    <FormControl>
                      <SelectTrigger className='w-full'>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>{t('products.form.noCategory')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.form.description')}</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FieldError messageKey='tooLong' />
                </FormItem>
              )}
            />
          </section>

          <section className='bg-card space-y-4 border p-4 lg:p-6'>
            <h2 className='font-medium'>{t('products.form.pricingSection')}</h2>
            <FormField
              control={form.control}
              name='pricing_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.form.pricingType')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='grid gap-3 sm:grid-cols-2'
                    >
                      {(['linear_meter', 'square_meter'] as const).map((value) => (
                        <label
                          key={value}
                          htmlFor={`pricing-${value}`}
                          className='has-[[data-state=checked]]:border-foreground flex cursor-pointer gap-3 border p-3'
                        >
                          <RadioGroupItem id={`pricing-${value}`} value={value} className='mt-0.5' />
                          <span>
                            <span className='block text-sm font-medium'>
                              {value === 'linear_meter' ? t('products.linearMeter') : t('products.squareMeter')}
                            </span>
                            <span className='text-muted-foreground mt-1 block text-xs leading-5'>
                              {value === 'linear_meter'
                                ? t('products.form.linearMeterHint')
                                : t('products.form.squareMeterHint')}
                            </span>
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='base_price'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.form.basePrice')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      inputMode='numeric'
                      min={0}
                      step={1000}
                      className='max-w-xs'
                      {...field}
                      value={String(field.value ?? '')}
                    />
                  </FormControl>
                  <FormDescription>
                    {pricingType === 'linear_meter'
                      ? t('products.form.basePriceHintLinear')
                      : t('products.form.basePriceHintSquare')}
                  </FormDescription>
                  <FieldError messageKey='numberInvalid' />
                </FormItem>
              )}
            />
          </section>

          <section className='bg-card space-y-6 border p-4 lg:p-6'>
            <h2 className='font-medium'>{t('products.form.options')}</h2>
            {pricingType === 'linear_meter' ? (
              <OptionList
                control={form.control}
                name='pleat_options'
                title={t('products.form.pleatOptions')}
                hint={t('products.form.pleatOptionsHint')}
                valueKey='multiplier'
                valueLabel={t('products.form.multiplier')}
                valueStep='0.05'
                defaultValue={1}
                hasError={Boolean(errors.pleat_options)}
              />
            ) : null}
            <OptionList
              control={form.control}
              name='fabric_options'
              title={t('products.form.fabricOptions')}
              hint={t('products.form.fabricOptionsHint')}
              valueKey='price_delta'
              valueLabel={t('products.form.priceDelta')}
              valueStep='1000'
              defaultValue={0}
              hasColor
              hasError={Boolean(errors.fabric_options)}
            />
            <OptionList
              control={form.control}
              name='motor_options'
              title={t('products.form.motorOptions')}
              hint={t('products.form.motorOptionsHint')}
              valueKey='price'
              valueLabel={t('products.form.optionPrice')}
              valueStep='1000'
              defaultValue={0}
              hasError={Boolean(errors.motor_options)}
            />
          </section>
        </div>

        <div className='space-y-6'>
          <section className='bg-card space-y-4 border p-4 lg:p-6'>
            <h2 className='font-medium'>{t('products.form.photos')}</h2>
            <FormField
              control={form.control}
              name='images'
              render={({ field }) => (
                <FormItem>
                  <ImageUpload folder='products' max={12} value={field.value} onChange={field.onChange} />
                  <FormDescription>{t('products.form.imagesHint')}</FormDescription>
                </FormItem>
              )}
            />
          </section>

          <section className='bg-card border p-4 lg:p-6'>
            <FormField
              control={form.control}
              name='is_active'
              render={({ field }) => (
                <FormItem className='flex items-start justify-between gap-4'>
                  <div>
                    <FormLabel>{t('products.form.isActive')}</FormLabel>
                    <FormDescription className='mt-1'>{t('products.form.isActiveHint')}</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <div className='flex gap-3'>
            <Button type='submit' size='lg' className='h-11 flex-1 rounded-none' disabled={isPending}>
              {isPending ? <Loader2 className='animate-spin' aria-hidden /> : null}
              {isPending ? t('common.saving') : t('common.save')}
            </Button>
            <Button asChild type='button' variant='outline' size='lg' className='h-11 rounded-none'>
              <Link href={ROUTES.ADMIN_PRODUCTS}>{t('common.cancel')}</Link>
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function EditProduct({ id }: { id: string }) {
  const { data, isLoading, isError, refetch } = useAdminProductQuery(id);

  return (
    <QueryState isLoading={isLoading} isError={isError} onRetry={refetch}>
      {data ? <ProductForm product={data} /> : null}
    </QueryState>
  );
}

/** Create (`id` omitted) or edit a product. */
export default function AdminProductFormPage({ id }: { id?: string }) {
  const { t } = useTranslations('admin');

  return (
    <>
      <div>
        <Link
          href={ROUTES.ADMIN_PRODUCTS}
          className='text-muted-foreground hover:text-foreground mb-3 inline-flex items-center gap-2 text-sm'
        >
          <ArrowLeft className='size-4' aria-hidden />
          {t('products.title')}
        </Link>
        <AdminPageHeader title={id ? t('products.edit') : t('products.new')} />
      </div>
      {id ? <EditProduct id={id} /> : <ProductForm />}
    </>
  );
}
